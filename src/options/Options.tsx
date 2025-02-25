import { debounce } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import './Options.css'

export const Options = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [apiEndpoint, setApiEndpoint] = useState('')

  const handleClose = () => window.close()

  useEffect(() => {
    chrome.storage.sync.get(['apiEndpoint'], (result) => {
      if (result.apiEndpoint) setApiEndpoint(result.apiEndpoint)
    })
  }, [])

  useEffect(() => {
    debounce(() => {
      chrome.storage.sync.set({ apiEndpoint })
    }, 500)
  }, [apiEndpoint])

  return (
    <main className="options-container">
      <h2 className="options-title">Extension Settings</h2>

      <section className="options-section">
        <h3 className="section-title">API Configuration</h3>
        <div className="option-row">
          <label htmlFor="api-endpoint" className="option-label">
            API Endpoint:
          </label>
          <input
            ref={inputRef}
            id="api-endpoint"
            className="option-input"
            type="text"
            value={apiEndpoint}
            onChange={(e) => setApiEndpoint(e.target.value)}
          />
        </div>
      </section>

      <section className="options-section">
        <h3 className="section-title">Actions</h3>
        <div className="option-row">
          <button className="close-button" onClick={handleClose}>
            Close
          </button>
        </div>
      </section>
    </main>
  )
}

export default Options
