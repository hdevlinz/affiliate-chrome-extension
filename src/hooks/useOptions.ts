import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { storageService } from '../services/storage.service'
import { SyncStorageState } from '../types'
import { alert } from '../utils/alert'
import { createLogger } from '../utils/logger'

const logger = createLogger('useOptions')

export function useOptions() {
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [creatorIdsEndpoint, setCreatorIdsEndpoint] = useState('')
  const [postCreatorDataEndpoint, setPostCreatorDataEndpoint] = useState('')
  const [postCreatorErrorEndpoint, setPostCreatorErrorEndpoint] = useState('')

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await storageService.getSyncStorage()

      setApiKeyValue(settings.apiKeyValue || '')
      setCreatorIdsEndpoint(settings.creatorIdsEndpoint || '')
      setPostCreatorDataEndpoint(settings.postCreatorDataEndpoint || '')
      setPostCreatorErrorEndpoint(settings.postCreatorErrorEndpoint || '')
    }

    loadSettings()
  }, [])

  const debouncedSaveToStorage = useCallback(
    debounce(async (settingsToSave: Partial<SyncStorageState>) => {
      logger.debug('Saving settings to storage', settingsToSave)
      try {
        await storageService.updateSyncStorage(settingsToSave)
      } catch (error) {
        logger.error('Failed to save settings to storage', error)
      }
    }, 1000),
    []
  )

  const handleSaveSettings = async () => {
    // Cancel any pending debounced save operations
    debouncedSaveToStorage.cancel()

    try {
      await storageService.updateSyncStorage({
        apiKeyValue,
        creatorIdsEndpoint,
        postCreatorDataEndpoint,
        postCreatorErrorEndpoint,
      })

      alert.success('Settings Saved', 'Your settings have been saved successfully.')
    } catch (error) {
      alert.error('Save Error', 'Could not save settings.')
    }
  }

  const handleResetSettings = () => {
    alert
      .warning('Reset Settings', 'Are you sure you want to reset all settings? This action cannot be undone.')
      .then(async (result) => {
        if (result.isConfirmed) {
          setApiKeyValue('')
          setCreatorIdsEndpoint('')
          setPostCreatorDataEndpoint('')
          setPostCreatorErrorEndpoint('')

          try {
            await storageService.clearSyncStorage()
            alert.success('Settings Reset', 'All settings have been reset.')
          } catch (error) {
            alert.error('Reset Error', 'Could not reset settings in storage.')
          }
        }
      })
  }

  useEffect(() => {
    if (apiKeyValue !== undefined) {
      debouncedSaveToStorage({ apiKeyValue })
    }
  }, [apiKeyValue, debouncedSaveToStorage])

  useEffect(() => {
    if (creatorIdsEndpoint !== undefined) {
      debouncedSaveToStorage({ creatorIdsEndpoint })
    }
  }, [creatorIdsEndpoint, debouncedSaveToStorage])

  useEffect(() => {
    if (postCreatorDataEndpoint !== undefined) {
      debouncedSaveToStorage({ postCreatorDataEndpoint })
    }
  }, [postCreatorDataEndpoint, debouncedSaveToStorage])

  useEffect(() => {
    if (postCreatorErrorEndpoint !== undefined) {
      debouncedSaveToStorage({ postCreatorErrorEndpoint })
    }
  }, [postCreatorErrorEndpoint, debouncedSaveToStorage])

  return {
    apiKeyValue,
    setApiKeyValue,
    creatorIdsEndpoint,
    setCreatorIdsEndpoint,
    postCreatorDataEndpoint,
    setPostCreatorDataEndpoint,
    postCreatorErrorEndpoint,
    setPostCreatorErrorEndpoint,
    handleSaveSettings,
    handleResetSettings
  }
}
