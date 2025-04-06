import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, FIND_CREATOR_URL } from '../config/constants'
import { storageService } from '../services/storage.service'
import { Creator, NotificationOptions } from '../types'
import { ActionType } from '../types/enums'
import { isNullOrUndefined } from '../utils/checks'
import { createLogger } from '../utils/logger'

const logger = createLogger('Background')

logger.info('Background script started')

chrome.runtime.onInstalled.addListener(async () => {
  logger.info('Extension installed, initializing storage')
  await storageService.initialize()
  await chrome.sidePanel.setOptions({ enabled: false })
})

chrome.action.onClicked.addListener(async ({ id, url }) => {
  if (isNullOrUndefined(id) || isNullOrUndefined(url)) return

  const parsedUrl = new URL(url)
  if (!parsedUrl.host.includes(AFFILIATE_TIKTOK_HOST) || parsedUrl.pathname !== FIND_CREATOR_PATH) {
    return await chrome.tabs.create({ url: FIND_CREATOR_URL })
  }

  await chrome.tabs.sendMessage(id, { action: ActionType.TOGGLE_SIDE_PANEL })
})

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.info('Received message:', message)

  switch (message.action) {
    case ActionType.SAVE_DATA: {
      // Save crawled creator data to storage
      try {
        const { crawledCreators = [] } = await storageService.getLocalStorage()

        const updatedCrawledCreators = [...crawledCreators, message.data] as Creator[]
        await storageService.updateLocalStorage({ crawledCreators: updatedCrawledCreators })

        logger.info('Creator data saved successfully', {
          id: message.data.id,
          uniqueId: message.data.uniqueId,
          totalSaved: updatedCrawledCreators.length
        })
      } catch (error) {
        logger.error('Failed to save creator data', error)
      }
      break
    }

    case ActionType.SHOW_NOTIFICATION: {
      // Show browser notification
      try {
        const options = message.notification as NotificationOptions
        const notificationOptions: chrome.notifications.NotificationOptions<true> = {
          type: 'basic',
          iconUrl: 'img/logo-128.png',
          title: options.title || 'Notification',
          message: options.message || 'Empty message'
        }
        chrome.notifications.create('', notificationOptions)
        logger.info('Notification shown', options)
      } catch (error) {
        logger.error('Failed to show notification', error)
      }
      break
    }

    case ActionType.OPEN_SIDE_PANEL: {
      try {
        await chrome.sidePanel.setOptions({ enabled: true })
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        if (tabs[0]?.id) {
          await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.TOGGLE_SIDE_PANEL })
        }
        logger.info('Side panel opened via message')
      } catch (error) {
        logger.error('Failed to open side panel', error)
      }
      break
    }

    default: {
      logger.warn(`Unknown action received: ${message.action}`)
    }
  }
})
