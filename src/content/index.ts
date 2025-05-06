import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH } from '../config/constants'
import { crawlerService } from '../services/crawler.service'
import { storageService } from '../services/storage.service'
import { InterceptData } from '../types'
import { ActionType } from '../types/enums'
import { injector } from '../utils/injector'
import { createLogger } from '../utils/logger'

const logger = createLogger('Content')

logger.info('Content script started')

const initializeCrawlerPage = (): void => {
  logger.info('Initializing crawler page')

  injector.injectExternalJS(chrome.runtime.getURL('inject/interceptor.js'))
  injector.injectExternalCSS(chrome.runtime.getURL('inject/styles.css'))
  injector.injectSidePanel()

  setupMessageListeners()
  setupWindowListeners()

  logger.info('Crawler page initialized')
}

const setupMessageListeners = (): void => {
  chrome.runtime.onMessage.addListener(async (message) => {
    logger.info('Received message:', message)

    switch (message.action) {
      case ActionType.START_CRAWLING: {
        // Initialize a new crawling session
        const { creatorIds = [], useApi = false, startTime = Date.now() } = message

        // First stop any active crawling
        crawlerService.stopCrawling()

        // Update storage with new session data
        await storageService.updateLocalStorage({
          isCrawling: true,
          startTime,
          currentCreatorIndex: 0,
          creatorIds,
          crawledCreators: [],
          notFoundCreators: [],
          useApi,
          processCount: 0
        })

        // Start crawling
        await crawlerService.startCrawling(useApi, creatorIds, startTime)
        break
      }

      case ActionType.CONTINUE_CRAWLING: {
        // Continue an existing crawling session
        const localSettings = await storageService.getLocalStorage()

        await storageService.updateLocalStorage({ isCrawling: true })

        // Configure the crawler with existing data
        crawlerService.updateState({
          useApi: localSettings.useApi || false,
          isCrawling: true,
          startTime: localSettings.startTime || Date.now(),
          currentCreatorIndex: localSettings.currentCreatorIndex || 0,
          creatorIds: localSettings.creatorIds || [],
          notFoundCreators: localSettings.notFoundCreators || []
        })

        // Continue the crawling process
        crawlerService.continueCrawling()
        break
      }

      case ActionType.STOP_CRAWLING: {
        // Stop the active crawling process
        crawlerService.stopCrawling()
        break
      }

      case ActionType.RESET_CRAWLING: {
        // Reset all crawling state and data
        crawlerService.stopCrawling()
        crawlerService.resetState()
        break
      }

      case ActionType.TOGGLE_SIDE_PANEL: {
        // Toggle the side panel visibility
        const sidePanelDiv = document.getElementById('sidepanel-container')
        sidePanelDiv ? sidePanelDiv.remove() : injector.injectSidePanel()
        break
      }

      default: {
        logger.warn(`Unknown action received: ${message.action}`)
      }
    }
  })
}

const setupWindowListeners = (): void => {
  window.addEventListener(
    'message',
    async (event) => {
      // Only process messages from our window and with the correct type
      if (event.source !== window || event.data.type !== 'affiliate') {
        return
      }

      // Handle intercepted network data
      if (event.data.action === ActionType.FETCH_DATA) {
        const interceptData: InterceptData = event.data.payload
        await crawlerService.processInterceptedData(interceptData)
      } else {
        logger.warn(`Unknown action received from interceptor script: ${event.data.action}`)
      }
    },
    false
  )
}

;(async () => {
  if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
    initializeCrawlerPage()
  }
})()
