import { debounce } from 'lodash'
import { useCallback, useEffect, useState } from 'react'
import { swal } from '../utils/swal'
import './Options.css'

export const Options = () => {
  const [mdCreatorIdsUrl, setMdCreatorIdsUrl] = useState('')
  const [mdCreatorPostUrl, setMdCreatorPostUrl] = useState('')
  const [mdCreatorErrorUrl, setMdCreatorErrorUrl] = useState('')
  const [mdApiKeyFormat, setMdApiKeyFormat] = useState('')
  const [mdApiKeyValue, setMdApiKeyValue] = useState('')

  const handleResetSettings = () => {
    swal
      .warning('Warning', 'Are you sure you want to reset all settings? This action cannot be undone.')
      .then((result) => {
        if (result.isConfirmed) {
          setMdCreatorIdsUrl('')
          setMdCreatorPostUrl('')
          setMdCreatorErrorUrl('')
          setMdApiKeyFormat('')
          setMdApiKeyValue('')
        }
      })
  }

  const debouncedSetStorage = useCallback((key: any, value: any) => {
    chrome.storage.sync.set({ [key]: value })
  }, [])

  useEffect(() => {
    chrome.storage.sync.get(null, (syncResult) => {
      setMdCreatorIdsUrl(syncResult.mdCreatorIdsUrl || '')
      setMdCreatorPostUrl(syncResult.mdCreatorPostUrl || '')
      setMdCreatorErrorUrl(syncResult.mdCreatorErrorUrl || '')
      setMdApiKeyFormat(syncResult.mdApiKeyFormat || '')
      setMdApiKeyValue(syncResult.mdApiKeyValue || '')
    })
  }, [])

  useEffect(() => {
    const debouncedFn = debounce((value) => debouncedSetStorage('mdCreatorIdsUrl', value), 1000)
    debouncedFn(mdCreatorIdsUrl)

    return () => debouncedFn.cancel()
  }, [mdCreatorIdsUrl, debouncedSetStorage])

  useEffect(() => {
    const debouncedFn = debounce((value) => debouncedSetStorage('mdCreatorPostUrl', value), 1000)
    debouncedFn(mdCreatorPostUrl)

    return () => debouncedFn.cancel()
  }, [mdCreatorPostUrl, debouncedSetStorage])

  useEffect(() => {
    const debouncedFn = debounce((value) => debouncedSetStorage('mdCreatorErrorUrl', value), 1000)
    debouncedFn(mdCreatorErrorUrl)

    return () => debouncedFn.cancel()
  }, [mdCreatorErrorUrl, debouncedSetStorage])

  useEffect(() => {
    const debouncedFn = debounce((value) => debouncedSetStorage('mdApiKeyFormat', value), 1000)
    debouncedFn(mdApiKeyFormat)

    return () => debouncedFn.cancel()
  }, [mdApiKeyFormat, debouncedSetStorage])

  useEffect(() => {
    const debouncedFn = debounce((value) => debouncedSetStorage('mdApiKeyValue', value), 1000)
    debouncedFn(mdApiKeyValue)

    return () => debouncedFn.cancel()
  }, [mdApiKeyValue, debouncedSetStorage])

  return (
    <main className="options-container">
      <h2 className="options-title">Extension Settings</h2>

      <section className="options-section">
        <h3 className="section-title">API Configuration</h3>

        <div className="option-row api-key-row">
          <div className="api-key-column">
            <label htmlFor="api-key-format" className="option-label">
              API Key Format:
            </label>
            <input
              id="api-key-format"
              className="option-input"
              type="text"
              value={mdApiKeyFormat}
              onChange={(e) => setMdApiKeyFormat(e.target.value)}
            />
          </div>
          <div className="api-key-column">
            <label htmlFor="api-key-value" className="option-label">
              API Key Value:
            </label>
            <input
              id="api-key-value"
              className="option-input"
              type="text"
              value={mdApiKeyValue}
              onChange={(e) => setMdApiKeyValue(e.target.value)}
            />
          </div>
        </div>

        <div className="option-row">
          <label htmlFor="get-creator-ids-endpoint" className="option-label">
            Get Creator Ids Endpoint:
          </label>
          <input
            id="get-creator-ids-endpoint"
            className="option-input"
            type="text"
            value={mdCreatorIdsUrl}
            onChange={(e) => setMdCreatorIdsUrl(e.target.value)}
          />
        </div>

        <div className="option-row">
          <label htmlFor="post-creator-data-endpoint" className="option-label">
            Post Creators Data Endpoint:
          </label>
          <input
            id="post-creator-data-endpoint"
            className="option-input"
            type="text"
            value={mdCreatorPostUrl}
            onChange={(e) => setMdCreatorPostUrl(e.target.value)}
          />
        </div>

        <div className="option-row">
          <label htmlFor="post-creator-errors-endpoint" className="option-label">
            Post Creators Error Endpoint:
          </label>
          <input
            id="post-creator-errors-endpoint"
            className="option-input"
            type="text"
            value={mdCreatorErrorUrl}
            onChange={(e) => setMdCreatorErrorUrl(e.target.value)}
          />
        </div>
      </section>

      <section className="options-section">
        <h3 className="section-title">Actions</h3>
        <div className="option-row">
          <button className="reset-button" onClick={handleResetSettings}>
            Reset Settings
          </button>
          <button className="close-button" style={{ marginLeft: 'auto' }} onClick={() => window.close()}>
            Close
          </button>
        </div>
      </section>
    </main>
  )
}

export default Options
