import { useOptions } from '../hooks/useOptions'
import { TimeIntervalUnit } from '../types/enums'
import './Options.scss'

export const Options = () => {
  const {
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
    intervalDuration,
    setIntervalDuration,
    intervalUnit,
    setIntervalUnit,
    handleSaveSettings,
    handleResetSettings
  } = useOptions()

  return (
    <main className="options">
      <h2 className="options__title">Extension Settings</h2>

      {/* API Configuration Section */}
      <section className="options__section">
        <h3 className="section-title">API Configuration</h3>

        <div className="options__row options__row--api-key">
          <div className="api-key-group">
            <div className="api-key-group__column">
              <label htmlFor="api-key-format" className="options__label">
                API Key Format:
              </label>
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

        <div className="options__row">
          <label htmlFor="get-creator-ids-endpoint" className="options__label">
            Get Creator IDs URL:
          </label>
          <input
            id="get-creator-ids-endpoint"
            className="options__input"
            type="url"
            placeholder="Enter URL to fetch creator IDs"
            value={creatorIdsEndpoint}
            onChange={(e) => setCreatorIdsEndpoint(e.target.value)}
          />
        </div>

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

        <div className="options__row">
          <label htmlFor="crawl-interval-duration" className="options__label">
            Auto Crawl Interval:
          </label>
          <div className="options__input-group">
            <input
              id="crawl-interval-duration"
              className="options__input options__input--interval-duration"
              type="number"
              min="1"
              placeholder="Duration"
              value={intervalDuration}
              onChange={(e) => setIntervalDuration(e.target.value)}
            />

            <select
              id="crawl-interval-unit"
              className="options__input options__input--interval-unit"
              value={intervalUnit}
              onChange={(e) => setIntervalUnit(e.target.value as TimeIntervalUnit)}
            >
              <option value={TimeIntervalUnit.SECONDS}>Seconds</option>
              <option value={TimeIntervalUnit.MINUTES}>Minutes</option>
              <option value={TimeIntervalUnit.HOURS}>Hours</option>
            </select>
          </div>
        </div>
      </section>

      {/* Actions Section */}
      <section className="options__section">
        <h3 className="section-title">Actions</h3>
        <div className="options__row options__row--actions">
          {/* Use reusable button class + modifier */}
          <button className="button button--reset" onClick={handleResetSettings}>
            Reset All Settings
          </button>

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
