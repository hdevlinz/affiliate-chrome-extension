import { merge } from 'lodash'
import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, PROFILE_TYPE } from '../types/constants'
import { ActionType, ConsoleType } from '../types/enums'
import { isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { injector } from '../utils/injector'
import { logger } from '../utils/logger'

logger({
  message: 'Content script: Running',
  level: ConsoleType.INFO
})

if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
  const msToken = localStorage.getItem('msToken')
  chrome.storage.local.set({ hasMsToken: !!msToken })

  if (msToken) {
    injector.injectExternalJS(chrome.runtime.getURL('inject/interceptor.js'))
    injector.injectExternalCSS(chrome.runtime.getURL('inject/styles.css'))
    injector.injectSidePanel()
  }
}

const allFetchPromises: Promise<any>[] = []
let isCrawling = false
let startTime = 0
let creatorIds: string[] = []
let currentCreatorIndex = 0

chrome.runtime.onMessage.addListener(async (message) => {
  logger({
    message: `Content script: Received message:`,
    data: message,
    level: ConsoleType.INFO
  })

  switch (message.action) {
    case ActionType.START_CRAWLING:
      allFetchPromises.length = 0
      isCrawling = true
      startTime = message.startTime || Date.now()
      creatorIds = message.creatorIds || []
      handleCrawlCreators()
      break

    case ActionType.CONTINUE_CRAWLING:
      chrome.storage.local.get(['creatorIds', 'currentCreatorIndex'], (store) => {
        isCrawling = true
        creatorIds = store.creatorIds || []
        currentCreatorIndex = store.currentCreatorIndex || 0
        handleCrawlCreators()
      })
      break

    case ActionType.STOP_CRAWLING:
      isCrawling = false
      break

    case ActionType.RESET_CRAWLING:
      allFetchPromises.length = 0
      isCrawling = false
      startTime = 0
      creatorIds = []
      currentCreatorIndex = 0
      break

    case ActionType.TOGGLE_SIDEBAR:
      const aduSidePanelDiv = document.getElementById('adu-sidepanel-container')
      aduSidePanelDiv ? aduSidePanelDiv.remove() : injector.injectSidePanel()
      break

    default:
      logger({
        message: `Content script: Unknown action received: ${message.action}`,
        level: ConsoleType.WARN
      })
  }
})

// Listen for messages from the interceptor script
window.addEventListener(
  'message',
  async (event) => {
    if (
      event.source !== window ||
      event.data.type !== 'adu_affiliate' ||
      isCrawling !== true ||
      currentCreatorIndex >= creatorIds.length
    )
      return

    if (event.data.action !== ActionType.FETCH_DATA) {
      return logger({
        message: `Content script: Unknown action received from interceptor script: ${event.data.action}`,
        level: ConsoleType.WARN
      })
    }

    const eventPayload = event.data.payload
    const currentCreatorId = creatorIds[currentCreatorIndex]

    logger({
      message: 'Content script: Received data from interceptor script:',
      data: eventPayload,
      level: ConsoleType.INFO
    })

    const creatorProfiles = eventPayload.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === currentCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      return chrome.storage.local.get(['notFoundCreators'], async ({ notFoundCreators }) => {
        const updateNotFoundCreators = [...(notFoundCreators || []), currentCreatorId]
        await chrome.storage.local.set({ notFoundCreators: updateNotFoundCreators })
        logger({
          message: `Content script: Creator '${currentCreatorId}' not found in search results.`,
          level: ConsoleType.WARN
        })
      })
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

        return { data: profileData }
      } catch (error) {
        logger({
          message: `Content script: Error fetching profile type '${type}' for creator '${currentCreatorId}':`,
          data: error,
          level: ConsoleType.ERROR
        })
      }
    })

    allFetchPromises.push(...fetchCreatorProfiles)

    const creatorProfileResponses = await Promise.all(fetchCreatorProfiles)
    const filteredProfileResults = creatorProfileResponses.filter(Boolean)

    if (isEmptyArray(filteredProfileResults)) {
      return logger({
        message: `Content script: No profile data for creator '${currentCreatorId}'.`,
        level: ConsoleType.WARN
      })
    }

    const creatorProfile = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item.data))
    }

    logger({
      message: `Content script: profiles of creator: ${currentCreatorId}`,
      data: creatorProfile,
      level: ConsoleType.INFO
    })
    await chrome.runtime.sendMessage({ action: ActionType.SAVE_DATA, data: creatorProfile })
  },
  false
)

const handleCrawlCreators = async () => {
  if (!isCrawling) return

  if (currentCreatorIndex >= creatorIds.length) {
    await Promise.allSettled(allFetchPromises) // Wait for all promises to complete

    return chrome.storage.local.set(
      {
        isCrawling: false,
        crawlDurationSeconds: Math.round((Date.now() - startTime) / 1000)
      },
      async () => {
        await chrome.runtime.sendMessage({
          action: ActionType.SHOW_NOTIFICATION,
          notification: {
            title: isCrawling ? 'Creator Crawler Completed' : 'Creator Crawler Stopped',
            message: isCrawling
              ? 'The creator crawling process has been completed for all creators.'
              : 'The creator crawling process has been stopped.'
          }
        })
        allFetchPromises.length = 0
        isCrawling = false
        startTime = 0
        creatorIds = []
        currentCreatorIndex = 0
      }
    )
  }

  const searchInput = document.querySelector('input[data-tid="m4b_input_search"]') as HTMLInputElement
  if (!searchInput) {
    isCrawling = false
    logger({
      message: 'Content script: Search input field not found! Crawling cannot continue.',
      level: ConsoleType.ERROR
    })
    return
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

  logger({
    message: `Content script: Search creator: ${currentCreatorId} (Index: ${currentCreatorIndex + 1}/${creatorIds.length})`,
    level: ConsoleType.INFO
  })

  setTimeout(async () => {
    currentCreatorIndex++
    await chrome.storage.local.set({ currentCreatorIndex })
    handleCrawlCreators()
  }, 5000)
}
