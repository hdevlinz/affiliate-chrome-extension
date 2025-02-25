import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, FIND_CREATOR_URL } from '../types/constants'
import { ActionType } from '../types/enums'
import { isNullOrUndefined } from '../utils/checks'
import { logger } from '../utils/logger'

logger.info('Background script: Running')

const INITIAL_STORAGE_STATE = {
  hasMsToken: false,
  isCrawling: false,
  processCount: 0,
  crawlDurationSeconds: 0,
  creatorIds: [],
  crawledCreators: [],
  notFoundCreators: [],
  currentCreatorIndex: 0
}

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  logger.info(`Background script: Received message:`, message)

  switch (message.action) {
    case ActionType.SAVE_DATA:
      chrome.storage.local.get(['crawledCreators'], async ({ crawledCreators }) => {
        const updatedCrawledCreators = [...(crawledCreators || []), message.data]
        await chrome.storage.local.set({ crawledCreators: updatedCrawledCreators })
      })
      break

    case ActionType.SHOW_NOTIFICATION:
      const notificationOptions: chrome.notifications.NotificationOptions<true> = {
        type: 'basic',
        iconUrl: 'img/logo-128.png',
        title: message.notification.title || 'Notification',
        message: message.notification.message || 'Empty message'
      }
      chrome.notifications.create('', notificationOptions)
      break

    default:
      logger.warn(`Background script: Unknown action received: ${message.action}`)
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set(INITIAL_STORAGE_STATE)
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

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  chrome.tabs.get(tabId, async (tab) => await checkAffiliatePage(tabId, tab.url))
})

chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => await checkAffiliatePage(tabId, tab.url))

const checkAffiliatePage = async (tabId: number, url: string | undefined) => {
  if (!url) return

  const parsedUrl = new URL(url)
  if (parsedUrl.host.includes(AFFILIATE_TIKTOK_HOST) && parsedUrl.pathname === FIND_CREATOR_PATH) {
    return await chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const msToken = localStorage.getItem('msToken')
        await chrome.storage.local.set({ hasMsToken: !!msToken })
      }
    })
  }
}
