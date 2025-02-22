import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, FIND_CREATOR_URL } from '../types/constants'
import { ActionType, ConsoleType } from '../types/enums'
import { isNullOrUndefined } from '../utils/checks'
import { logger } from '../utils/logger'

logger({
  message: 'Background script: Running',
  level: ConsoleType.INFO,
})

const INIT_STORAGE_DATA = {
  isStarted: false,
  processCount: 0,
  crawledCreators: [],
  creatorIds: [],
  hasMsToken: false,
}

chrome.runtime.onInstalled.addListener(async () => {
  try {
    await chrome.sidePanel.setOptions({ enabled: false })
    await chrome.storage.local.set(INIT_STORAGE_DATA)
  } catch (error) {
    logger({
      message: 'Background script: Error initializing settings on install:',
      data: chrome.runtime.lastError?.message || error,
      level: ConsoleType.ERROR,
    })
  }
})

chrome.action.onClicked.addListener(async ({ id, url }) => {
  if (isNullOrUndefined(id) || isNullOrUndefined(url)) return

  try {
    const parsedUrl = new URL(url)
    if (!parsedUrl.host.includes(AFFILIATE_TIKTOK_HOST) || parsedUrl.pathname !== FIND_CREATOR_PATH) {
      return await chrome.tabs.create({ url: FIND_CREATOR_URL })
    }

    await chrome.tabs.sendMessage(id, { action: ActionType.TOGGLE_SIDEBAR })
  } catch (error) {
    logger({
      message: 'Background script: Error handling action click:',
      data: chrome.runtime.lastError?.message || error,
      level: ConsoleType.ERROR,
    })
  }
})

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  chrome.tabs.get(tabId, async (tab) => await checkTabUrlAndExecuteScript(tabId, tab.url))
})

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => await checkTabUrlAndExecuteScript(tabId, tab.url))

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger({
    message: `Background script: Received message:`,
    data: message,
    level: ConsoleType.INFO,
  })

  try {
    switch (message.action) {
      case ActionType.SAVE_DATA:
        chrome.storage.local.get(['crawledCreators'], async ({ crawledCreators }) => {
          const updatedCrawledCreators = [...(crawledCreators || []), message.data]
          await chrome.storage.local.set({ crawledCreators: updatedCrawledCreators })
        })
        break

      case ActionType.CHECK_LOGGED:
        if (isNullOrUndefined(sender.tab?.id)) return

        const hasMsToken = message.hasMsToken
        await chrome.storage.local.set({ hasMsToken: !!hasMsToken })
        if (!hasMsToken) {
          return await chrome.tabs.sendMessage(sender.tab?.id, { action: ActionType.LOGIN_REQUIRED })
        }

        await chrome.action.enable(sender.tab?.id)
        break

      case ActionType.SHOW_NOTIFICATION:
        const notificationOptions: chrome.notifications.NotificationOptions<true> = {
          type: 'basic',
          iconUrl: 'img/logo-128.png',
          title: message.notification.title || 'Notification',
          message: message.notification.message || 'Empty message',
        }
        chrome.notifications.create('', notificationOptions)
        break

      default:
        logger({
          message: `Background script: Unknown action received: ${message.action}`,
          level: ConsoleType.WARN,
        })
    }
  } catch (error) {
    logger({
      message: `Background script: Error processing message: ${message.action}`,
      data: chrome.runtime.lastError?.message || error,
      level: ConsoleType.ERROR,
    })
  }
})

const checkTabUrlAndExecuteScript = async (tabId: number, url: string | undefined) => {
  if (!url) return

  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.host.includes(AFFILIATE_TIKTOK_HOST) && parsedUrl.pathname === FIND_CREATOR_PATH) {
      return await chrome.scripting.executeScript({
        target: { tabId },
        func: async () => {
          const msToken = localStorage.getItem('msToken')
          await chrome.tabs.sendMessage(tabId, { action: ActionType.CHECK_LOGGED, hasMsToken: !!msToken })
        },
      })
    }

    await chrome.action.disable(tabId)
  } catch (error) {
    logger({
      message: `Background script: Error checking tab URL: ${url}`,
      data: chrome.runtime.lastError?.message || error,
      level: ConsoleType.ERROR,
    })
  }
}
