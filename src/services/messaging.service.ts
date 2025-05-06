import { ExtensionMessage, NotificationOptions } from '../types'
import { ActionType } from '../types/enums'
import { createLogger } from '../utils/logger'

const logger = createLogger('MessagingService')

class MessagingService {
  public async sendToBackground(message: ExtensionMessage): Promise<any> {
    try {
      return await chrome.runtime.sendMessage(message)
    } catch (error) {
      logger.error('Error sending message to background script', error)
      throw error
    }
  }

  public async sendToTab(tabId: number, message: ExtensionMessage): Promise<any> {
    try {
      return await chrome.tabs.sendMessage(tabId, message)
    } catch (error) {
      logger.error(`Error sending message to tab ${tabId}`, error)
      throw error
    }
  }

  public async sendToActiveTab(message: ExtensionMessage): Promise<any> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      if (!tabs[0]?.id) {
        throw new Error('No active tab found')
      }

      return await chrome.tabs.sendMessage(tabs[0].id, message)
    } catch (error) {
      logger.error('Error sending message to active tab', error)
      throw error
    }
  }

  public async showNotification(options: NotificationOptions): Promise<void> {
    await this.sendToBackground({
      action: ActionType.SHOW_NOTIFICATION,
      notification: options
    })
  }

  public async startCrawling(useApi: boolean, creatorIds: string[]): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.START_CRAWLING,
      startTime: Date.now(),
      useApi,
      creatorIds
    })
  }

  public async continueCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.CONTINUE_CRAWLING
    })
  }

  public async stopCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.STOP_CRAWLING
    })
  }

  public async resetCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.RESET_CRAWLING
    })
  }

  public async completeCrawling(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.COMPLETED_CRAWLING
    })
  }

  public async toggleSidePanel(): Promise<void> {
    await this.sendToActiveTab({
      action: ActionType.TOGGLE_SIDE_PANEL
    })
  }

  public async saveCreatorData(data: any): Promise<void> {
    await this.sendToBackground({
      action: ActionType.SAVE_DATA,
      data
    })
  }
}

export const messagingService = new MessagingService()
