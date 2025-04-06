import { ExtensionMessage, NotificationOptions } from '../types'
import { ActionType } from '../types/enums'
import { createLogger } from '../utils/logger'

const logger = createLogger('MessagingService')

class MessagingService {
  /**
   * Send a message to the background script
   * @param message - The message to send
   */
  public async sendToBackground(message: ExtensionMessage): Promise<any> {
    try {
      logger.debug('Sending message to background script', message)
      return await chrome.runtime.sendMessage(message)
    } catch (error) {
      logger.error('Error sending message to background script', error)
      throw error
    }
  }

  /**
   * Send a message to a specific tab
   * @param tabId - The ID of the tab to send the message to
   * @param message - The message to send
   */
  public async sendToTab(tabId: number, message: ExtensionMessage): Promise<any> {
    try {
      logger.debug(`Sending message to tab ${tabId}`, message)
      return await chrome.tabs.sendMessage(tabId, message)
    } catch (error) {
      logger.error(`Error sending message to tab ${tabId}`, error)
      throw error
    }
  }

  /**
   * Send a message to the active tab
   * @param message - The message to send
   */
  public async sendToActiveTab(message: ExtensionMessage): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs[0]?.id) {
        throw new Error('No active tab found')
      }
      logger.debug('Sending message to active tab', message)
      return await chrome.tabs.sendMessage(tabs[0].id, message)
    } catch (error) {
      logger.error('Error sending message to active tab', error)
      throw error
    }
  }

  /**
   * Show a notification
   * @param options - The notification options
   */
  public async showNotification(options: NotificationOptions): Promise<void> {
    await this.sendToBackground({
      action: ActionType.SHOW_NOTIFICATION,
      notification: options
    })
  }

  /**
   * Start a crawling session
   * @param useApi - Whether to use the API
   * @param creatorIds - The creator IDs to crawl
   */
  public async startCrawling(useApi: boolean, creatorIds: string[]): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.START_CRAWLING,
      useApi,
      startTime: Date.now(),
      creatorIds
    })
  }

  /**
   * Continue a paused crawling session
   */
  public async continueCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.CONTINUE_CRAWLING
    })
  }

  /**
   * Stop an active crawling session
   */
  public async stopCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.STOP_CRAWLING
    })
  }

  /**
   * Reset the crawling session and clear data
   */
  public async resetCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.RESET_CRAWLING
    })
  }

  /**
   * Toggle the side panel visibility
   */
  public async toggleSidePanel(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.TOGGLE_SIDE_PANEL
    })
  }

  /**
   * Save creator data to storage
   * @param data - The creator data to save
   */
  public async saveCreatorData(data: any): Promise<void> {
    await this.sendToBackground({
      action: ActionType.SAVE_DATA,
      data
    })
  }
}

export const messagingService = new MessagingService()
