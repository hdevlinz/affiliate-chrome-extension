import { DEFAULT_STORAGE_STATE } from '../config/constants'
import { LocalStorageState, SyncStorageState } from '../types'
import { createLogger } from '../utils/logger'

const logger = createLogger('StorageService')

class StorageService {
  public async initialize(): Promise<void> {
    await chrome.storage.local.set(DEFAULT_STORAGE_STATE)
  }

  /**
   * Get all local storage values
   */
  public async getLocalStorage(): Promise<Partial<LocalStorageState>> {
    try {
      return (await chrome.storage.local.get(null)) as Partial<LocalStorageState>
    } catch (error) {
      logger.error('Failed to get local storage', error)
      return {}
    }
  }

  /**
   * Get all sync storage values
   */
  public async getSyncStorage(): Promise<Partial<SyncStorageState>> {
    try {
      return (await chrome.storage.sync.get(null)) as Partial<SyncStorageState>
    } catch (error) {
      logger.error('Failed to get sync storage', error)
      return {}
    }
  }

  /**
   * Update local storage with partial state
   */
  public async updateLocalStorage(state: Partial<LocalStorageState>): Promise<void> {
    try {
      await chrome.storage.local.set(state)
    } catch (error) {
      logger.error('Failed to update local storage', error)
      throw error
    }
  }

  /**
   * Update sync storage with partial API config
   */
  public async updateSyncStorage(config: Partial<SyncStorageState>): Promise<void> {
    try {
      await chrome.storage.sync.set(config)
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
    } catch (error) {
      logger.error('Failed to clear sync storage', error)
      throw error
    }
  }
}

export const storageService = new StorageService()
