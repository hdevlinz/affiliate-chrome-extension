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

let crawlTimeoutId: NodeJS.Timeout | null = null

const state = {
  fetchPromises: [] as Promise<any>[],
  postCreatorDataEndpoint: null as string | null,
  postCreatorErrorEndpoint: null as string | null,
  headers: {} as Record<string, string>,
  useApi: false,
  isCrawling: false,
  startTime: 0,
  creatorIds: [] as string[],
  notFoundCreators: [] as string[],
  currentCreatorIndex: 0
}

const restartCrawlSession = () => {
  Object.assign(state, {
    fetchPromises: [],
    postCreatorDataEndpoint: null,
    postCreatorErrorEndpoint: null,
    customHeaders: {},
    useApi: false,
    isCrawling: false,
    startTime: 0,
    creatorIds: [],
    notFoundCreators: [],
    currentCreatorIndex: 0
  })
}

// Post creators data to endpoint
const handlePostCreatorsData = async (data: any) => {
  const validatedCreatorsData = Array.isArray(data) ? data : [data]

  try {
    await fetch(state.postCreatorDataEndpoint as string, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        ...state.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validatedCreatorsData)
    })
  } catch (error) {
    logger.error('Content script: Error posting creators data:', error)
  }
}

// Post creators error to endpoint
const handlePostCreatorsError = async (data: CrawlError | CrawlError[]) => {
  const validatedCreatorsError = Array.isArray(data) ? data : [data]

  try {
    await fetch(state.postCreatorErrorEndpoint as string, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        ...state.headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(validatedCreatorsError)
    })
  } catch (error) {
    logger.error('Content script: Error posting creators error:', error)
  }
}

// Handle crawling creators
const handleCrawlCreators = async () => {
  // Check if crawling should stop
  if (!state.isCrawling || state.currentCreatorIndex >= state.creatorIds.length) {
    if (crawlTimeoutId) {
      clearTimeout(crawlTimeoutId)
      crawlTimeoutId = null
    }

    await Promise.allSettled(state.fetchPromises)

    if (!state.isCrawling && state.currentCreatorIndex < state.creatorIds.length) {
      return await chrome.runtime.sendMessage({
        action: ActionType.SHOW_NOTIFICATION,
        notification: {
          title: 'Creator Crawler Stopped',
          message: 'The creator crawling process has been stopped.'
        }
      })
    }

    const { crawledCreators } = await chrome.storage.local.get(['crawledCreators'])
    const validCrawledCreators = isNullOrUndefined(crawledCreators) ? [] : crawledCreators
    const crawledCreatorIds = validCrawledCreators.map((creator: { id: any }) => creator.id)

    await chrome.storage.local.set({
      isCrawling: false,
      crawlDurationSeconds: Math.round((Date.now() - state.startTime) / 1000),
      notFoundCreators: state.notFoundCreators.filter((creatorId) => !crawledCreatorIds.includes(creatorId))
    })

    await chrome.runtime.sendMessage({
      action: ActionType.SHOW_NOTIFICATION,
      notification: {
        title: 'Creator Crawler Completed',
        message: 'The creator crawling process has been completed for all creators.'
      }
    })
    return restartCrawlSession()
  }

  // Find search input
  const searchInput = document.querySelector('input[data-tid="m4b_input_search"]') as HTMLInputElement | null
  if (!searchInput) {
    if (crawlTimeoutId) {
      clearTimeout(crawlTimeoutId)
      crawlTimeoutId = null
    }

    state.isCrawling = false
    logger.warn('Content script: Search input field not found! Crawling cannot continue.')
    return
  }

  // Update process count
  const { processCount } = await chrome.storage.local.get(['processCount'])
  await chrome.storage.local.set({ processCount: (processCount || 0) + 1 })

  // Search current creator
  const currentCreatorId = state.creatorIds[state.currentCreatorIndex]
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

  // Move to next creator
  crawlTimeoutId = setTimeout(async () => {
    crawlTimeoutId = null
    state.currentCreatorIndex++
    await chrome.storage.local.set({ currentCreatorIndex: state.currentCreatorIndex })
    await handleCrawlCreators()
  }, 4000)

  logger.info(
    `Content script: Search creator: ${currentCreatorId} (Index: ${state.currentCreatorIndex + 1} / ${state.creatorIds.length})`
  )
}

chrome.runtime.onMessage.addListener(async (message) => {
  logger.info(`Content script: Received message:`, message)

  switch (message.action) {
    case ActionType.START_CRAWLING: {
      const syncResult = await chrome.storage.sync.get(null)
      restartCrawlSession()

      state.postCreatorDataEndpoint = syncResult.postCreatorDataEndpoint
      state.postCreatorErrorEndpoint = syncResult.postCreatorErrorEndpoint
      state.useApi = !!message.useApi

      if (state.useApi && isEmpty(state.postCreatorDataEndpoint) && isEmpty(state.postCreatorErrorEndpoint)) {
        await chrome.storage.local.set({ isCrawling: false })
        return await chrome.runtime.sendMessage({
          action: ActionType.SHOW_NOTIFICATION,
          notification: {
            title: 'Creator Crawler Stopped',
            message: 'API endpoint is not set! Crawling cannot start.'
          }
        })
      }

      state.headers = {
        ...state.headers,
        ...(syncResult.apiKeyFormat && syncResult.apiKeyValue
          ? { [syncResult.apiKeyFormat]: syncResult.apiKeyValue }
          : {})
      }

      state.isCrawling = true
      state.startTime = message.startTime || Date.now()
      state.creatorIds = message.creatorIds || []
      await handleCrawlCreators()
      break
    }

    case ActionType.CONTINUE_CRAWLING: {
      const syncResult = await chrome.storage.sync.get(null)
      state.postCreatorDataEndpoint = syncResult.postCreatorDataEndpoint
      state.postCreatorErrorEndpoint = syncResult.postCreatorErrorEndpoint

      const localResult = await chrome.storage.local.get(null)
      state.useApi = !!localResult.useApi

      if (state.useApi && isEmpty(state.postCreatorDataEndpoint) && isEmpty(state.postCreatorErrorEndpoint)) {
        await chrome.storage.local.set({ isCrawling: false })
        return await chrome.runtime.sendMessage({
          action: ActionType.SHOW_NOTIFICATION,
          notification: {
            title: 'Creator Crawler Stopped',
            message: 'Content script: API endpoint is not set! Crawling cannot continue.'
          }
        })
      }

      state.headers = {
        ...state.headers,
        ...(syncResult.apiKeyFormat && syncResult.apiKeyValue
          ? { [syncResult.apiKeyFormat]: syncResult.apiKeyValue }
          : {})
      }

      state.isCrawling = true
      state.creatorIds = localResult.creatorIds || []
      state.notFoundCreators = localResult.notFoundCreators || []
      state.currentCreatorIndex = localResult.currentCreatorIndex || 0
      await handleCrawlCreators()
      break
    }

    case ActionType.STOP_CRAWLING: {
      if (crawlTimeoutId) {
        clearTimeout(crawlTimeoutId)
        crawlTimeoutId = null
        logger.info('Content script: Cleared pending crawl timeout due to STOP.')
      }

      state.isCrawling = false
      await chrome.storage.local.set({ isCrawling: false })
      break
    }

    case ActionType.RESET_CRAWLING: {
      if (crawlTimeoutId) {
        clearTimeout(crawlTimeoutId)
        crawlTimeoutId = null
        logger.info('Content script: Cleared pending crawl timeout due to RESET.')
      }

      restartCrawlSession()
      break
    }

    case ActionType.TOGGLE_SIDE_PANEL: {
      const devlinSidePanelDiv = document.getElementById('devlin-sidepanel-container')
      devlinSidePanelDiv ? devlinSidePanelDiv.remove() : injector.injectSidePanel()
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
    if (
      event.source !== window ||
      event.data.type !== 'adu_affiliate' ||
      state.currentCreatorIndex >= state.creatorIds.length
    ) {
      return
    }

    if (event.data.action !== ActionType.FETCH_DATA) {
      return logger.warn(`Content script: Unknown action received from interceptor script: ${event.data.action}`)
    }

    const eventPayload = event.data.payload
    const currentCreatorId = state.creatorIds[state.currentCreatorIndex]

    logger.info('Content script: Received data from interceptor script:', eventPayload)

    const creatorProfiles = eventPayload.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === currentCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      logger.warn(`Content script: Creator potentially not found in affiliate system: ${currentCreatorId}`)

      if (!state.notFoundCreators.includes(currentCreatorId)) {
        state.notFoundCreators.push(currentCreatorId)
        logger.info(`Content script: Added ${currentCreatorId} to notFoundCreators list.`)

        if (state.useApi) {
          await handlePostCreatorsError({
            data: { creator_id: currentCreatorId },
            code: CREATOR_NOT_FOUND,
            message: 'Creator potentially not found in affiliate system'
          })
        }
      } else {
        logger.warn(`Content script: ${currentCreatorId} is already in notFoundCreators. Skipping duplicate add.`)
      }

      return
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
          logger.error(`Content script: Error fetching profiles of creator: ${currentCreatorId}`, error)
        }
      }
    )

    state.fetchPromises.push(...fetchCreatorProfiles)

    const creatorProfileResponses = await Promise.all(fetchCreatorProfiles)
    const filteredProfileResults = creatorProfileResponses.filter(Boolean)

    if (isEmptyArray(filteredProfileResults)) {
      logger.warn(`Content script: Profiles not found for creator: ${currentCreatorId}`)

      return (
        state.useApi &&
        (await handlePostCreatorsError({
          data: { creator_id: currentCreatorId },
          code: CREATOR_HAS_NO_PROFILES,
          message: `Creator '${currentCreatorId}' has no profiles.`
        }))
      )
    }

    const creatorData = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item.data))
    }

    logger.info(`Content script: profiles of creator: ${currentCreatorId}`, creatorData)
    state.useApi && (await handlePostCreatorsData(creatorData))
    await chrome.runtime.sendMessage({ action: ActionType.SAVE_DATA, data: creatorData })
  },
  false
)
