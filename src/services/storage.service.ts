import { StorageState, ApiConfig } from '../types'
import { DEFAULT_STORAGE_STATE } from '../config/constants'
import { TimeIntervalUnit } from '../types/enums'
import { createLogger } from '../utils/logger'

const logger = createLogger('StorageService')

class StorageService {
  public async initialize(): Promise<void> {
    logger.info('Initializing storage with default values')
    await chrome.storage.local.set(DEFAULT_STORAGE_STATE)
  }

  /**
   * Get all local storage values
   */
  public async getLocalStorage(): Promise<Partial<StorageState>> {
    try {
      return (await chrome.storage.local.get(null)) as Partial<StorageState>
    } catch (error) {
      logger.error('Failed to get local storage', error)
      return {}
    }
  }

  /**
   * Get all sync storage values
   */
  public async getSyncStorage(): Promise<Partial<ApiConfig>> {
    try {
      return (await chrome.storage.sync.get(null)) as Partial<ApiConfig>
    } catch (error) {
      logger.error('Failed to get sync storage', error)
      return {}
    }
  }

  /**
   * Update local storage with partial state
   */
  public async updateLocalStorage(state: Partial<StorageState>): Promise<void> {
    try {
      await chrome.storage.local.set(state)
      logger.debug('Local storage updated', state)
    } catch (error) {
      logger.error('Failed to update local storage', error)
      throw error
    }
  }

  /**
   * Update sync storage with partial API config
   */
  public async updateSyncStorage(config: Partial<ApiConfig>): Promise<void> {
    try {
      await chrome.storage.sync.set(config)
      logger.debug('Sync storage updated', config)
    } catch (error) {
      logger.error('Failed to update sync storage', error)
      throw error
    }
  }

  /**
   * Clear all local storage data
   */
  public async clearLocalStorage(): Promise<void> {
    try {
      await chrome.storage.local.clear()
      logger.info('Local storage cleared')
    } catch (error) {
      logger.error('Failed to clear local storage', error)
      throw error
    }
  }

  /**
   * Clear all sync storage data
   */
  public async clearSyncStorage(): Promise<void> {
    try {
      await chrome.storage.sync.clear()
      logger.info('Sync storage cleared')
    } catch (error) {
      logger.error('Failed to clear sync storage', error)
      throw error
    }
  }

  /**
   * Get specific crawl settings
   */
  public async getCrawlSettings(): Promise<{
    useApi: boolean
    isCrawling: boolean
    creatorIds: string[]
    currentCreatorIndex: number
    crawlIntervalDuration: number
    crawlIntervalUnit: TimeIntervalUnit
  }> {
    const data = await this.getLocalStorage()
    return {
      useApi: data.useApi ?? false,
      isCrawling: data.isCrawling ?? false,
      creatorIds: data.creatorIds ?? [],
      currentCreatorIndex: data.currentCreatorIndex ?? 0,
      crawlIntervalDuration: data.crawlIntervalDuration ?? DEFAULT_STORAGE_STATE.crawlIntervalDuration,
      crawlIntervalUnit: (data.crawlIntervalUnit as TimeIntervalUnit) ?? DEFAULT_STORAGE_STATE.crawlIntervalUnit
    }
  }

  /**
   * Convert time interval to seconds based on unit
   */
  public convertToSeconds(value: number, unit: TimeIntervalUnit): number {
    switch (unit) {
      case TimeIntervalUnit.MINUTES:
        return value * 60
      case TimeIntervalUnit.HOURS:
        return value * 3600
      case TimeIntervalUnit.SECONDS:
      default:
        return value
    }
  }

  /**
   * Format a seconds value based on a time unit
   */
  public formatFromSeconds(seconds: number, unit: TimeIntervalUnit): number {
    switch (unit) {
      case TimeIntervalUnit.MINUTES:
        return seconds / 60
      case TimeIntervalUnit.HOURS:
        return seconds / 3600
      case TimeIntervalUnit.SECONDS:
      default:
        return seconds
    }
  }
}

export const storageService = new StorageService()
