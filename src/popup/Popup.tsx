import { useState } from 'react'
import { FaChartBar, FaCog, FaInfoCircle, FaPlay, FaSlidersH } from 'react-icons/fa'
import { AFFILIATE_TIKTOK_HOST, FIND_CREATOR_PATH, FIND_CREATOR_URL } from '../config/constants'
import { useCrawler } from '../hooks/useCrawler'
import { ActionType } from '../types/enums'
import './Popup.scss'

export const Popup = () => {
  const [activeTab, setActiveTab] = useState('status')
  const { crawledCount, processCount, totalIds, crawlProgress, isCrawling, isAutoCrawling, canContinue } = useCrawler()

  const openCreatorIdsPage = () => chrome.tabs.create({ url: FIND_CREATOR_URL })

  const handleClickQuickStart = () => openCreatorIdsPage()

  const openSidePanel = () => {
    if (window.location.host.includes(AFFILIATE_TIKTOK_HOST) && window.location.pathname === FIND_CREATOR_PATH) {
      chrome.runtime.sendMessage({ action: ActionType.OPEN_SIDE_PANEL })
    } else {
      openCreatorIdsPage()
    }
  }

  const openOptionsPage = () => chrome.runtime.openOptionsPage()

  return (
    <main className="popup">
      <header className="popup-header">
        <h3 className="popup-title">TikTok Data Crawler</h3>
        <div className="popup-tabs">
          <button
            className={`popup-tab ${activeTab === 'status' ? 'popup-tab--active' : ''}`}
            onClick={() => setActiveTab('status')}
          >
            <FaChartBar />
            <span>Status</span>
          </button>

          <button
            className={`popup-tab ${activeTab === 'actions' ? 'popup-tab--active' : ''}`}
            onClick={() => setActiveTab('actions')}
          >
            <FaPlay />
            <span>Actions</span>
          </button>

          <button
            className={`popup-tab ${activeTab === 'settings' ? 'popup-tab--active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FaSlidersH />
            <span>Settings</span>
          </button>
        </div>
      </header>

      <div className="popup-content">
        {activeTab === 'status' && (
          <div className="popup-status">
            <div className="status-card">
              <div className="status-info">
                <div className="status-item">
                  <span className="status-label">Crawled:</span>
                  <span className="status-value">{crawledCount}</span>
                </div>

                <div className="status-item">
                  <span className="status-label">Progress:</span>
                  <span className="status-value">
                    {processCount} / {totalIds || 0}
                  </span>
                </div>

                <div className="status-item">
                  <span className="status-label">Status:</span>
                  <span className="status-value status-indicator">
                    {isCrawling ? (
                      <>
                        <span className="dot dot--active"></span> Crawling
                      </>
                    ) : isAutoCrawling ? (
                      <>
                        <span className="dot dot--auto"></span> Auto Mode
                      </>
                    ) : canContinue ? (
                      <>
                        <span className="dot dot--paused"></span> Paused
                      </>
                    ) : (
                      <>
                        <span className="dot"></span> Idle
                      </>
                    )}
                  </span>
                </div>
              </div>

              {(crawlProgress > 0 || isCrawling) && (
                <div className="status-progress">
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${crawlProgress}%` }}></div>
                  </div>
                  <span className="progress-text">{crawlProgress}%</span>
                </div>
              )}
            </div>

            <button className="popup-button" onClick={openSidePanel}>
              Toggle Side Panel
            </button>
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="popup-actions">
            <div className="action-buttons">
              <button className="action-button" onClick={handleClickQuickStart}>
                <FaPlay />
                <span>Quick Start</span>
              </button>

              <button className="action-button" onClick={openSidePanel}>
                <FaInfoCircle />
                <span>Details</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="popup-settings">
            <button className="popup-button" onClick={openOptionsPage}>
              <FaCog />
              <span>Open Settings</span>
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default Popup
