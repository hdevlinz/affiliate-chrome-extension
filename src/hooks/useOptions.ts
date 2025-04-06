import { useState, useEffect, useCallback } from 'react'
import { debounce } from 'lodash'
import { TimeIntervalUnit } from '../types/enums'
import { ApiConfig } from '../types'
import { alert } from '../utils/alert'
import { storageService } from '../services/storage.service'
import { createLogger } from '../utils/logger'

const logger = createLogger('useOptions')

export function useOptions() {
  // API settings
  const [creatorIdsEndpoint, setCreatorIdsEndpoint] = useState('')
  const [postCreatorDataEndpoint, setPostCreatorDataEndpoint] = useState('')
  const [postCreatorErrorEndpoint, setPostCreatorErrorEndpoint] = useState('')
  const [apiKeyFormat, setApiKeyFormat] = useState('')
  const [apiKeyValue, setApiKeyValue] = useState('')

  // Crawl interval settings
  const [intervalDuration, setIntervalDuration] = useState('')
  const [intervalUnit, setIntervalUnit] = useState<TimeIntervalUnit>(TimeIntervalUnit.SECONDS)

  useEffect(() => {
    const loadSettings = async () => {
      logger.debug('Loading settings from storage')
      const settings = await storageService.getSyncStorage()

      setCreatorIdsEndpoint(settings.creatorIdsEndpoint || '')
      setPostCreatorDataEndpoint(settings.postCreatorDataEndpoint || '')
      setPostCreatorErrorEndpoint(settings.postCreatorErrorEndpoint || '')
      setApiKeyFormat(settings.apiKeyFormat || '')
      setApiKeyValue(settings.apiKeyValue || '')

      const storedUnit = settings.crawlIntervalUnit || TimeIntervalUnit.SECONDS
      setIntervalUnit(storedUnit as TimeIntervalUnit)

      if (settings.crawlIntervalDuration) {
        const durationInSeconds = Number(settings.crawlIntervalDuration)
        let displayValue = durationInSeconds.toString()

        if (storedUnit === TimeIntervalUnit.MINUTES) {
          displayValue = (durationInSeconds / 60).toString()
        } else if (storedUnit === TimeIntervalUnit.HOURS) {
          displayValue = (durationInSeconds / 3600).toString()
        }

        setIntervalDuration(displayValue)
      } else {
        setIntervalDuration('')
      }
    }

    loadSettings()
  }, [])

  const debouncedSaveToStorage = useCallback(
    debounce(async (settingsToSave: Partial<ApiConfig>) => {
      logger.debug('Saving settings to storage', settingsToSave)
      try {
        await storageService.updateSyncStorage(settingsToSave)
      } catch (error) {
        logger.error('Failed to save settings to storage', error)
      }
    }, 1000),
    []
  )

  const handleResetSettings = () => {
    alert
      .warning('Reset Settings', 'Are you sure you want to reset all settings? This action cannot be undone.')
      .then(async (result) => {
        if (result.isConfirmed) {
          setCreatorIdsEndpoint('')
          setPostCreatorDataEndpoint('')
          setPostCreatorErrorEndpoint('')
          setApiKeyFormat('')
          setApiKeyValue('')
          setIntervalDuration('')
          setIntervalUnit(TimeIntervalUnit.SECONDS)

          try {
            await storageService.clearSyncStorage()
            alert.success('Settings Reset', 'All settings have been reset.')
          } catch (error) {
            logger.error('Failed to clear sync storage', error)
            alert.error('Reset Error', 'Could not reset settings in storage.')
          }
        }
      })
  }

  const handleSaveSettings = async () => {
    // Validate interval duration if provided
    const numericValue = parseFloat(intervalDuration)
    if (intervalDuration !== '' && (isNaN(numericValue) || numericValue <= 0)) {
      return alert.error('Invalid Interval', 'Interval duration must be empty or a positive number.')
    }

    // Cancel any pending debounced save operations
    debouncedSaveToStorage.cancel()

    // Convert interval duration to seconds based on selected unit
    const durationInSeconds =
      intervalDuration === '' || isNaN(numericValue) || numericValue <= 0
        ? undefined
        : intervalUnit === TimeIntervalUnit.MINUTES
          ? numericValue * 60
          : intervalUnit === TimeIntervalUnit.HOURS
            ? numericValue * 3600
            : numericValue

    try {
      await storageService.updateSyncStorage({
        creatorIdsEndpoint,
        postCreatorDataEndpoint,
        postCreatorErrorEndpoint,
        apiKeyFormat,
        apiKeyValue,
        crawlIntervalDuration: durationInSeconds,
        crawlIntervalUnit: intervalUnit
      })

      alert.success('Settings Saved', 'Your settings have been saved successfully.')
    } catch (error) {
      logger.error('Failed to save settings', error)
      alert.error('Save Error', 'Could not save settings.')
    }
  }

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

  useEffect(() => {
    if (apiKeyFormat !== undefined) {
      debouncedSaveToStorage({ apiKeyFormat })
    }
  }, [apiKeyFormat, debouncedSaveToStorage])

  useEffect(() => {
    if (apiKeyValue !== undefined) {
      debouncedSaveToStorage({ apiKeyValue })
    }
  }, [apiKeyValue, debouncedSaveToStorage])

  useEffect(() => {
    const numericValue = parseFloat(intervalDuration)
    if (!isNaN(numericValue) && numericValue > 0) {
      const durationInSeconds =
        intervalUnit === TimeIntervalUnit.MINUTES
          ? numericValue * 60
          : intervalUnit === TimeIntervalUnit.HOURS
            ? numericValue * 3600
            : numericValue

      debouncedSaveToStorage({
        crawlIntervalDuration: durationInSeconds,
        crawlIntervalUnit: intervalUnit
      })
    } else if (intervalDuration === '') {
      debouncedSaveToStorage({
        crawlIntervalDuration: undefined,
        crawlIntervalUnit: intervalUnit
      })
    }
  }, [intervalDuration, intervalUnit, debouncedSaveToStorage])

  return {
    // API settings
    creatorIdsEndpoint,
    setCreatorIdsEndpoint,
    postCreatorDataEndpoint,
    setPostCreatorDataEndpoint,
    postCreatorErrorEndpoint,
    setPostCreatorErrorEndpoint,
    apiKeyFormat,
    setApiKeyFormat,
    apiKeyValue,
    setApiKeyValue,

    // Interval settings
    intervalDuration,
    setIntervalDuration,
    intervalUnit,
    setIntervalUnit,

    // Actions
    handleSaveSettings,
    handleResetSettings
  }
}
