import { merge } from 'lodash'
import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, KEYS_TO_OMIT, PROFILE_TYPE } from '../types/constants'
import { ActionType } from '../types/enums'
import { isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { deepFlatten, deepOmit } from '../utils/helpers'
import { injector } from '../utils/injector'
import { logger } from '../utils/logger'

logger.info('Content script: Running')

if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
  const msToken = localStorage.getItem('msToken')
  chrome.storage.local.set({ hasMsToken: !!msToken })

  if (msToken) {
    injector.injectExternalJS(chrome.runtime.getURL('inject/interceptor.js'))
    injector.injectExternalCSS(chrome.runtime.getURL('inject/styles.css'))
    injector.injectSidePanel()
  }
}

const fetchPromisesList: Promise<any>[] = []
let isCrawling = false
let startTime = 0
let creatorIds: string[] = []
let notFoundCreators: string[] = []
let currentCreatorIndex = 0

chrome.runtime.onMessage.addListener(async (message) => {
  logger.info(`Content script: Received message:`, message)

  switch (message.action) {
    case ActionType.START_CRAWLING:
      fetchPromisesList.length = 0
      isCrawling = true
      startTime = message.startTime || Date.now()
      creatorIds = message.creatorIds || []
      notFoundCreators = []
      currentCreatorIndex = 0
      handleCrawlCreators()
      break

    case ActionType.CONTINUE_CRAWLING:
      chrome.storage.local.get(['creatorIds', 'notFoundCreators', 'currentCreatorIndex'], (result) => {
        isCrawling = true
        creatorIds = result.creatorIds || []
        notFoundCreators = result.notFoundCreators || []
        currentCreatorIndex = result.currentCreatorIndex || 0
        handleCrawlCreators()
      })
      break

    case ActionType.STOP_CRAWLING:
      isCrawling = false
      break

    case ActionType.RESET_CRAWLING:
      fetchPromisesList.length = 0
      isCrawling = false
      startTime = 0
      creatorIds = []
      notFoundCreators = []
      currentCreatorIndex = 0
      break

    case ActionType.TOGGLE_SIDE_PANEL:
      const aduSidePanelDiv = document.getElementById('adu-sidepanel-container')
      aduSidePanelDiv ? aduSidePanelDiv.remove() : injector.injectSidePanel()
      break

    default:
      logger.warn(`Content script: Unknown action received: ${message.action}`)
  }
})

// Listen for messages from the interceptor script
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
      return logger.warn(`Content script: Creator '${currentCreatorId}' not found in search results.`)
    }

    const headers = {
      ...eventPayload.requestHeaders,
      'Content-Type': 'application/json'
    }

    const fetchCreatorProfiles: Promise<any>[] = PROFILE_TYPE.sort(() => Math.random() - 0.5).map(async (type) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        const response = await fetch(eventPayload.url.replace('/find', '/profile'), {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            creator_oec_id: matchingCreator.creator_oecuid.value,
            profile_types: [type]
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
        logger.error(`Content script: Error fetching profile type '${type}' for creator '${currentCreatorId}':`, error)
      }
    })

    fetchPromisesList.push(...fetchCreatorProfiles)

    const creatorProfileResponses = await Promise.all(fetchCreatorProfiles)
    const filteredProfileResults = creatorProfileResponses.filter(Boolean)

    if (isEmptyArray(filteredProfileResults)) {
      return logger.warn(`Content script: Creator '${currentCreatorId}' has no profiles.`)
    }

    const creatorProfile = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item.data))
    }

    await chrome.runtime.sendMessage({ action: ActionType.SAVE_DATA, data: creatorProfile })
    logger.info(`Content script: profiles of creator: ${currentCreatorId}`, creatorProfile)
  },
  false
)

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
        fetchPromisesList.length = 0
        isCrawling = false
        startTime = 0
        creatorIds = []
        currentCreatorIndex = 0
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

  setTimeout(async () => {
    currentCreatorIndex++
    await chrome.storage.local.set({ currentCreatorIndex })
    handleCrawlCreators()
  }, 5000)

  logger.info(
    `Content script: Search creator: ${currentCreatorId} (Index: ${currentCreatorIndex + 1}/${creatorIds.length})`
  )
}
