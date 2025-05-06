import { useOptions } from '../hooks/useOptions'
import './Options.scss'

export const Options = () => {
  const {
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
              <label htmlFor="api-key-value" className="options__label">
                API Key Value:
              </label>
              <input
                id="api-key-value"
                className="options__input"
                type="password"
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
            type="text"
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
            type="text"
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
            type="text"
            placeholder="Enter URL to send error reports"
            value={postCreatorErrorEndpoint}
            onChange={(e) => setPostCreatorErrorEndpoint(e.target.value)}
          />
        </div>
      </section>

      {/* Actions Section */}
      <section className="options__section">
        <h3 className="section-title">Actions</h3>
        <div className="options__row options__row--actions">
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
