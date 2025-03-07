import { merge } from 'lodash'
import { CrawlError } from '../types'
import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, KEYS_TO_OMIT, PROFILE_TYPE } from '../types/constants'
import { ActionType } from '../types/enums'
import { CREATOR_HAS_NO_PROFILES, CREATOR_NOT_FOUND } from '../types/exceptions'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { deepFlatten, deepOmit } from '../utils/helpers'
import { injector } from '../utils/injector'
import { logger } from '../utils/logger'

logger.info('Content script: Running')

if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
  injector.injectExternalJS(chrome.runtime.getURL('inject/interceptor.js'))
  injector.injectExternalCSS(chrome.runtime.getURL('inject/styles.css'))
  injector.injectSidePanel()
}

const fetchPromisesList: Promise<any>[] = []
let mdCreatorPostUrl: string | null | undefined = null
let mdCreatorErrorUrl: string | null | undefined = null
let mdHeaders: any = {}
let useApi: boolean = false
let isCrawling: boolean = false
let startTime: number = 0
let creatorIds: string[] = []
let notFoundCreators: string[] = []
let currentCreatorIndex: number = 0

chrome.runtime.onMessage.addListener(async (message) => {
  logger.info(`Content script: Received message:`, message)

  switch (message.action) {
    case ActionType.START_CRAWLING: {
      chrome.storage.sync.get(null, (syncResult) => {
        restartCrawlSession()

        mdCreatorPostUrl = syncResult.mdCreatorPostUrl
        mdCreatorErrorUrl = syncResult.mdCreatorErrorUrl
        useApi = !!message.useApi

        if (useApi && isEmpty(mdCreatorPostUrl) && isEmpty(mdCreatorErrorUrl)) {
          return chrome.storage.local.set({ isCrawling: false }, () => {
            logger.error('Content script: API endpoint is not set! Crawling cannot start.')
          })
        }

        if (syncResult.mdApiKeyFormat && syncResult.mdApiKeyValue) {
          mdHeaders = {
            [syncResult.mdApiKeyFormat]: syncResult.mdApiKeyValue
          }
        }

        isCrawling = true
        startTime = message.startTime || Date.now()
        creatorIds = message.creatorIds || []
        handleCrawlCreators()
      })
      break
    }

    case ActionType.CONTINUE_CRAWLING: {
      chrome.storage.sync.get(null, (syncResult) => {
        mdCreatorPostUrl = syncResult.mdCreatorPostUrl
        mdCreatorErrorUrl = syncResult.mdCreatorErrorUrl

        chrome.storage.local.get(null, (localResult) => {
          useApi = !!localResult.useApi

          if (useApi && isEmpty(mdCreatorPostUrl) && isEmpty(mdCreatorErrorUrl)) {
            return chrome.storage.local.set({ isCrawling: false }, () => {
              logger.error('Content script: API endpoint is not set! Crawling cannot continue.')
            })
          }

          if (syncResult.mdApiKeyFormat && syncResult.mdApiKeyValue) {
            mdHeaders = {
              [syncResult.mdApiKeyFormat]: syncResult.mdApiKeyValue
            }
          }

          isCrawling = true
          creatorIds = localResult.creatorIds || []
          notFoundCreators = localResult.notFoundCreators || []
          currentCreatorIndex = localResult.currentCreatorIndex || 0
          handleCrawlCreators()
        })
      })

      break
    }

    case ActionType.STOP_CRAWLING: {
      isCrawling = false
      break
    }

    case ActionType.RESET_CRAWLING: {
      restartCrawlSession()
      break
    }

    case ActionType.TOGGLE_SIDE_PANEL: {
      const aduSidePanelDiv = document.getElementById('adu-sidepanel-container')
      aduSidePanelDiv ? aduSidePanelDiv.remove() : injector.injectSidePanel()
      break
    }

    default: {
      logger.warn(`Content script: Unknown action received: ${message.action}`)
    }
  }
})

window.addEventListener(
  'message',
  async (event) => {
    if (event.source !== window || event.data.type !== 'adu_affiliate' || currentCreatorIndex >= creatorIds.length) {
      return
    }

    if (event.data.action !== ActionType.FETCH_DATA) {
      return logger.warn(`Content script: Unknown action received from interceptor script: ${event.data.action}`)
    }

    const eventPayload = event.data.payload
    const currentCreatorId = creatorIds[currentCreatorIndex]

    logger.info('Content script: Received data from interceptor script:', eventPayload)

    const creatorProfiles = eventPayload.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === currentCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      notFoundCreators.push(currentCreatorId)

      useApi &&
        (await handlePostCreatorsError({
          data: { creator_id: currentCreatorId },
          code: CREATOR_NOT_FOUND,
          message: 'Creator not found in affiliate system'
        }))

      return logger.warn(`Content script: Creator '${currentCreatorId}' not found.`)
    }

    const headers = {
      ...eventPayload.requestHeaders,
      'Content-Type': 'application/json'
    }

    const fetchCreatorProfiles: Promise<any>[] = PROFILE_TYPE.sort(() => Math.random() - 0.5).map(
      async (profile_type) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          const response = await fetch(eventPayload.url.replace('/find', '/profile'), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              creator_oec_id: matchingCreator.creator_oecuid.value,
              profile_types: [profile_type]
            })
          })

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

          const crawlerResponse = await response.json()
          const { code, message, ...profileData } = crawlerResponse

          if (code !== 0 || message !== 'success') throw new Error(`API error! code: ${code}, message: ${message}`)

          const normalizedProfileData = deepFlatten(deepOmit(profileData, KEYS_TO_OMIT))
          return { data: normalizedProfileData }
        } catch (error) {
          notFoundCreators.push(currentCreatorId)
          logger.error(
            `Content script: Error fetching profile type '${profile_type}' for creator '${currentCreatorId}':`,
            error
          )
        }
      }
    )

    fetchPromisesList.push(...fetchCreatorProfiles)

    const creatorProfileResponses = await Promise.all(fetchCreatorProfiles)
    const filteredProfileResults = creatorProfileResponses.filter(Boolean)

    if (isEmptyArray(filteredProfileResults)) {
      useApi &&
        (await handlePostCreatorsError({
          data: { creator_id: currentCreatorId },
          code: CREATOR_HAS_NO_PROFILES,
          message: `Creator '${currentCreatorId}' has no profiles.`
        }))

      return logger.warn(`Content script: Creator '${currentCreatorId}' has no profiles.`)
    }

    const creatorData = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item.data))
    }

    logger.info(`Content script: profiles of creator: ${currentCreatorId}`, creatorData)
    await chrome.runtime.sendMessage({ action: ActionType.SAVE_DATA, data: creatorData })
    useApi && (await handlePostCreatorsData(creatorData))
  },
  false
)

const restartCrawlSession = () => {
  fetchPromisesList.length = 0
  mdCreatorPostUrl = null
  mdCreatorErrorUrl = null
  mdHeaders = {}
  useApi = false
  isCrawling = false
  startTime = 0
  creatorIds = []
  notFoundCreators = []
  currentCreatorIndex = 0
}

const handleCrawlCreators = async () => {
  if (!isCrawling || currentCreatorIndex >= creatorIds.length) {
    await Promise.allSettled(fetchPromisesList) // Wait for all promises to complete

    if (!isCrawling) {
      return await chrome.runtime.sendMessage({
        action: ActionType.SHOW_NOTIFICATION,
        notification: {
          title: 'Creator Crawler Stopped',
          message: 'The creator crawling process has been stopped.'
        }
      })
    }

    return chrome.storage.local.set(
      {
        isCrawling: false,
        crawlDurationSeconds: Math.round((Date.now() - startTime) / 1000),
        notFoundCreators
      },
      async () => {
        await chrome.runtime.sendMessage({
          action: ActionType.SHOW_NOTIFICATION,
          notification: {
            title: 'Creator Crawler Completed',
            message: 'The creator crawling process has been completed for all creators.'
          }
        })
        restartCrawlSession()
      }
    )
  }

  const searchInput = document.querySelector('input[data-tid="m4b_input_search"]') as HTMLInputElement | null
  if (!searchInput) {
    isCrawling = false
    return logger.warn('Content script: Search input field not found! Crawling cannot continue.')
  }

  chrome.storage.local.get(['processCount'], async ({ processCount }) => {
    const newProcessCount = (processCount || 0) + 1
    await chrome.storage.local.set({ processCount: newProcessCount })
  })

  const currentCreatorId = creatorIds[currentCreatorIndex]
  searchInput.value = currentCreatorId
  searchInput.dispatchEvent(new Event('input', { bubbles: true }))
  searchInput.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      keyCode: 13,
      which: 13,
      bubbles: true
    })
  )

  setTimeout(() => {
    currentCreatorIndex++
    chrome.storage.local.set({ currentCreatorIndex }, handleCrawlCreators)
  }, 4000)

  logger.info(
    `Content script: Search creator: ${currentCreatorId} (Index: ${currentCreatorIndex + 1} / ${creatorIds.length})`
  )
}

const handlePostCreatorsData = async (data: any) => {
  const validatedCreatorsData = Array.isArray(data) ? data : [data]

  try {
    const response = await fetch(mdCreatorPostUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...mdHeaders
      },
      body: JSON.stringify(validatedCreatorsData)
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    logger.info('Content script: Creators data posted successfully')
  } catch (error) {
    logger.error('Content script: Error posting creators data:', error)
  }
}

const handlePostCreatorsError = async (data: CrawlError | CrawlError[]) => {
  const validatedCreatorsError = Array.isArray(data) ? data : [data]

  try {
    const response = await fetch(mdCreatorErrorUrl as string, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...mdHeaders
      },
      body: JSON.stringify(validatedCreatorsError)
    })

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

    logger.info('Content script: Creators error posted successfully')
  } catch (error) {
    logger.error('Content script: Error posting creators error:', error)
  }
}
