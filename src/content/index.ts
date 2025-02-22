import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, PROFILE_TYPE } from '../types/constants'
import { ActionType, ConsoleType } from '../types/enums'
import { isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { injector } from '../utils/injector'
import { logger } from '../utils/logger'

logger({
  message: 'Content script: Running',
  level: ConsoleType.INFO,
})


if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
  injector.injectExternalJS(chrome.runtime.getURL('inject/interceptor.js'))
  injector.injectSidePanel()
  const msToken = localStorage.getItem('msToken')
  chrome.runtime.sendMessage({ action: ActionType.CHECK_LOGGED, hasMsToken: !!msToken })
}

const allFetchPromises: Promise<any>[] = []
let isCrawling = false
let currentCreatorIndex = 0
let creatorIds: string[] = []
let notFoundCreators: string[] = []

chrome.runtime.onMessage.addListener((message) => {
  logger({
    message: `Content script: Received message:`,
    data: message,
    level: ConsoleType.INFO,
  })

  switch (message.action) {
    case ActionType.START_CRAWLING:
      if (isCrawling) {
        return logger({
          message: 'Content script: Crawling already in progress, ignoring START command.',
          level: ConsoleType.WARN,
        })
      }

      isCrawling = true
      currentCreatorIndex = 0
      creatorIds = message.creatorIds
      notFoundCreators = []
      handleCrawlCreators()
      break

    case ActionType.STOP_CRAWLING:
      if (!isCrawling) {
        return logger({
          message: 'Content script: Crawling is not in progress, ignoring STOP command.',
          level: ConsoleType.WARN,
        })
      }

      isCrawling = false
      break

    case ActionType.TOGGLE_SIDEBAR:
      const aduSidePanelDiv = document.getElementById('adu-sidepanel-container')
      aduSidePanelDiv ? aduSidePanelDiv.remove() : injector.injectSidePanel()
      break

    default:
      logger({
        message: `Content script: Unknown action received from background script: ${message.action}`,
        level: ConsoleType.WARN,
      })
  }
})

// Listen for messages from the injected script
window.addEventListener(
  'message',
  async (event) => {
    if (
      event.source !== window ||
      event.data.type !== 'adu_affiliate' ||
      isCrawling !== true ||
      currentCreatorIndex >= creatorIds.length
    ) {
      return
    }

    if (event.data.action !== ActionType.FETCH_DATA) {
      return logger({
        message: `Content script: Unknown action received from injected script: ${event.data.action}`,
        level: ConsoleType.WARN,
      })
    }

    const eventPayload = event.data.payload
    const targetCreatorId = creatorIds[currentCreatorIndex]

    logger({
      message: 'Content script: Received data from injected script:',
      data: eventPayload,
      level: ConsoleType.INFO,
    })

    const creatorProfiles = eventPayload.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === targetCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      notFoundCreators.push(targetCreatorId)
      return logger({
        message: `Content script: Creator '${targetCreatorId}' not found in search results.`,
        level: ConsoleType.WARN,
      })
    }

    const fetchCreatorProfiles: Promise<any>[] = PROFILE_TYPE.sort(() => Math.random() - 0.5).map(async (type) => {
      try {
        const response = await fetch(eventPayload.url.replace('/find', '/profile'), {
          method: 'POST',
          headers: {
            ...eventPayload.requestHeaders,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creator_oec_id: matchingCreator.creator_oecuid.value,
            profile_types: [type],
          }),
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const crawlerResponse = await response.json()
        const { code, message, ...profileData } = crawlerResponse

        if (code !== 0 || message !== 'success') throw new Error(`API error! code: ${code}, message: ${message}`)

        return { profileType: type, data: profileData }
      } catch (error) {
        logger({
          message: `Content script: Error fetching profile type '${type}' for creator '${targetCreatorId}':`,
          data: error,
          level: ConsoleType.ERROR,
        })
      }
    })

    allFetchPromises.push(...fetchCreatorProfiles)

    try {
      const creatorProfileResponses = await Promise.all(fetchCreatorProfiles)
      const filteredProfileResults = creatorProfileResponses.filter(Boolean)

      if (isEmptyArray(filteredProfileResults)) {
        return logger({
          message: `Content script: No profile data for creator '${targetCreatorId}'.`,
          level: ConsoleType.WARN,
        })
      }

      const creatorProfile = {
        id: matchingCreator.creator_oecuid.value,
        uniqueId: matchingCreator.handle.value,
        nickname: matchingCreator.nickname.value,
        profiles: filteredProfileResults.map((item) => ({
          profileType: item.profileType,
          data: item.data,
        })),
      }

      logger({
        message: `Content script: Successfully fetched and processed profiles for creator: ${targetCreatorId}`,
        data: creatorProfile,
        level: ConsoleType.INFO,
      })
      await chrome.runtime.sendMessage({ action: ActionType.SAVE_DATA, data: creatorProfile })
    } catch (error) {
      logger({
        message: `Content script: Error during parallel profile fetching for creator '${targetCreatorId}':`,
        data: error,
        level: ConsoleType.ERROR,
      })
    }
  },
  false,
)

const handleCrawlCreators = async () => {
  if (!isCrawling || currentCreatorIndex >= creatorIds.length) {
    await Promise.allSettled(allFetchPromises) // Wait for all fetches to complete

    const endTime = Date.now()
    chrome.storage.local.get(['startTime'], async ({ startTime }) => {
      await chrome.storage.local.set({
        isStarted: false,
        notFoundCreators: notFoundCreators,
        crawlDurationSeconds: Math.round((endTime - (startTime as number)) / 1000),
      })
    })
    await chrome.runtime.sendMessage({
      action: ActionType.SHOW_NOTIFICATION,
      notification: {
        title: isCrawling ? 'Creator Crawler Completed' : 'Creator Crawler Stopped',
        message: isCrawling
          ? 'The creator crawling process has been completed for all creators.'
          : 'The creator crawling process has been stopped.',
      },
    })
    return
  }

  const searchInput = document.querySelector('input[data-tid="m4b_input_search"]') as HTMLInputElement
  if (!searchInput) {
    isCrawling = false
    logger({
      message: 'Content script: Critical error: Search input field not found! Crawling cannot continue.',
      level: ConsoleType.ERROR,
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
      bubbles: true,
    }),
  )

  logger({
    message: `Content script: Search creator: ${currentCreatorId} (Index: ${currentCreatorIndex + 1}/${creatorIds.length})`,
    level: ConsoleType.INFO,
  })

  setTimeout(() => {
    currentCreatorIndex++
    handleCrawlCreators()
  }, 5000)
}
