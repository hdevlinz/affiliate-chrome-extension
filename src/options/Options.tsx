import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { swal } from '../utils/swal'
import './Options.scss'

export const Options = () => {
  const [creatorIdsEndpoint, setCreatorIdsEndpoint] = useState('')
  const [postCreatorDataEndpoint, setPostCreatorDataEndpoint] = useState('')
  const [postCreatorErrorEndpoint, setPostCreatorErrorEndpoint] = useState('')
  const [apiKeyFormat, setApiKeyFormat] = useState('')
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [intervalDuration, setIntervalDuration] = useState('')
  const [intervalUnit, setIntervalUnit] = useState('seconds')

  useEffect(() => {
    chrome.storage.sync.get(null, (syncResult) => {
      setCreatorIdsEndpoint(syncResult.creatorIdsEndpoint || '')
      setPostCreatorDataEndpoint(syncResult.postCreatorDataEndpoint || '')
      setPostCreatorErrorEndpoint(syncResult.postCreatorErrorEndpoint || '')
      setApiKeyFormat(syncResult.apiKeyFormat || '')
      setApiKeyValue(syncResult.apiKeyValue || '')

      const storedUnit = syncResult.crawlIntervalUnit || 'seconds'
      setIntervalUnit(storedUnit)

      if (syncResult.crawlIntervalDuration) {
        const storedDurationSeconds = Number(syncResult.crawlIntervalDuration)
        let displayValue = storedDurationSeconds.toString()
        if (storedUnit === 'minutes') {
          displayValue = (storedDurationSeconds / 60).toString()
        } else if (storedUnit === 'hours') {
          displayValue = (storedDurationSeconds / 3600).toString()
        }
        setIntervalDuration(displayValue)
      } else {
        setIntervalDuration('')
      }
    })
  }, [])

  const debouncedSaveToStorage = useCallback(
    debounce(async (settingsToSave: { [key: string]: any }) => {
      console.log('Debounced save:', settingsToSave)
      try {
        await chrome.storage.sync.set(settingsToSave)
      } catch (error) {
        console.error('Failed to save to chrome.storage.sync:', error)
      }
    }, 1000),
    []
  )

  const handleResetSettings = () => {
    swal
      .warning('Reset Settings', 'Are you sure you want to reset all settings? This action cannot be undone.')
      .then(async (result) => {
        if (result.isConfirmed) {
          setCreatorIdsEndpoint('')
          setPostCreatorDataEndpoint('')
          setPostCreatorErrorEndpoint('')
          setApiKeyFormat('')
          setApiKeyValue('')
          setIntervalDuration('')
          setIntervalUnit('seconds')

          try {
            await chrome.storage.sync.clear()
            swal.success('Settings Reset', 'All settings have been reset.')
          } catch (error) {
            console.error('Failed to clear sync storage:', error)
            swal.error('Reset Error', 'Could not reset settings in storage.')
          }
        }
      })
  }

  const handleSaveSettings = async () => {
    const numericValue = parseFloat(intervalDuration)
    if (intervalDuration !== '' && (isNaN(numericValue) || numericValue <= 0)) {
      return swal.error('Invalid Interval', 'Interval duration must be empty or a positive number.')
    }

    debouncedSaveToStorage.cancel()

    const durationInSeconds =
      intervalDuration === '' || isNaN(numericValue) || numericValue <= 0
        ? null
        : intervalUnit === 'minutes'
          ? numericValue * 60
          : intervalUnit === 'hours'
            ? numericValue * 3600
            : numericValue

    try {
      await chrome.storage.sync.set({
        creatorIdsEndpoint: creatorIdsEndpoint,
        postCreatorDataEndpoint: postCreatorDataEndpoint,
        postCreatorErrorEndpoint: postCreatorErrorEndpoint,
        apiKeyFormat: apiKeyFormat,
        apiKeyValue: apiKeyValue,
        crawlIntervalDuration: durationInSeconds,
        crawlIntervalUnit: intervalUnit
      })
      swal.success('Settings Saved', 'Your settings have been saved successfully.')
    } catch (error) {
      console.error('Failed to save settings:', error)
      swal.error('Save Error', 'Could not save settings.')
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
        intervalUnit === 'minutes' ? numericValue * 60 : intervalUnit === 'hours' ? numericValue * 3600 : numericValue
      debouncedSaveToStorage({
        crawlIntervalDuration: durationInSeconds,
        crawlIntervalUnit: intervalUnit
      })
    } else if (intervalDuration === '') {
      debouncedSaveToStorage({ crawlIntervalDuration: null, crawlIntervalUnit: intervalUnit })
    }
  }, [intervalDuration, intervalUnit, debouncedSaveToStorage])

  return (
    // Use the new top-level class
    <main className="options">
      {/* Use the new title class */}
      <h2 className="options__title">Extension Settings</h2>

      {/* API Configuration Section */}
      <section className="options__section">
        <h3 className="section-title">API Configuration</h3>

        {/* API Key Row - Use modifier and new group/column classes */}
        <div className="options__row options__row--api-key">
          <div className="api-key-group">
            <div className="api-key-group__column">
              {/* Use the new label class */}
              <label htmlFor="api-key-format" className="options__label">
                API Key Format:
              </label>
              {/* Use the new input class */}
              <input
                id="api-key-format"
                className="options__input"
                type="text"
                placeholder="e.g., X-API-Key"
                value={apiKeyFormat}
                onChange={(e) => setApiKeyFormat(e.target.value)}
              />
            </div>
            <div className="api-key-group__column">
              <label htmlFor="api-key-value" className="options__label">
                API Key Value:
              </label>
              <input
                id="api-key-value"
                className="options__input"
                type="text"
                placeholder="Enter API Key Value"
                value={apiKeyValue}
                onChange={(e) => setApiKeyValue(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Get Creator IDs Endpoint Row */}
        <div className="options__row">
          <label htmlFor="get-creator-ids-endpoint" className="options__label">
            Get Creator IDs URL:
          </label>
          <input
            id="get-creator-ids-endpoint"
            className="options__input"
            type="url" // Use type="url" for better semantics/validation
            placeholder="Enter URL to fetch creator IDs"
            value={creatorIdsEndpoint}
            onChange={(e) => setCreatorIdsEndpoint(e.target.value)}
          />
        </div>

        {/* Post Creator Data Endpoint Row */}
        <div className="options__row">
          <label htmlFor="post-creator-data-endpoint" className="options__label">
            Post Data URL:
          </label>
          <input
            id="post-creator-data-endpoint"
            className="options__input"
            type="url"
            placeholder="Enter URL to send crawled data"
            value={postCreatorDataEndpoint}
            onChange={(e) => setPostCreatorDataEndpoint(e.target.value)}
          />
        </div>

        {/* Post Creator Error Endpoint Row */}
        <div className="options__row">
          <label htmlFor="post-creator-errors-endpoint" className="options__label">
            Post Errors URL:
          </label>
          <input
            id="post-creator-errors-endpoint"
            className="options__input"
            type="url"
            placeholder="Enter URL to send error reports"
            value={postCreatorErrorEndpoint}
            onChange={(e) => setPostCreatorErrorEndpoint(e.target.value)}
          />
        </div>
      </section>

      {/* Other Configuration Section */}
      <section className="options__section">
        <h3 className="section-title">Auto Crawl Configuration</h3>

        {/* Interval Duration Row */}
        <div className="options__row">
          <label htmlFor="crawl-interval-duration" className="options__label">
            Auto Crawl Interval:
          </label>
          {/* Use the new input group class */}
          <div className="options__input-group">
            <input
              id="crawl-interval-duration"
              // Add input modifier class
              className="options__input options__input--interval-duration"
              type="number"
              min="1" // Basic validation
              placeholder="Duration"
              value={intervalDuration}
              onChange={(e) => setIntervalDuration(e.target.value)}
            />
            <select
              id="crawl-interval-unit"
              // Add input modifier class
              className="options__input options__input--interval-unit"
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value)}
            >
              <option value="seconds">Seconds</option>
              <option value="minutes">Minutes</option>
              <option value="hours">Hours</option>
            </select>
          </div>
        </div>
      </section>

      {/* Actions Section */}
      <section className="options__section">
        <h3 className="section-title">Actions</h3>
        {/* Use action row modifier */}
        <div className="options__row options__row--actions">
          {/* Use reusable button class + modifier */}
          <button className="button button--reset" onClick={handleResetSettings}>
            Reset All Settings
          </button>
          {/* Use button group class for right-aligned buttons */}
          <div className="button-group">
            <button className="button button--close" onClick={() => window.close()}>
              Close
            </button>
            <button className="button button--save" onClick={handleSaveSettings}>
              Save Settings
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Options
