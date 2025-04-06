import { useEffect, useRef } from 'react'
import {
  FaCog,
  FaFileDownload,
  FaFileUpload,
  FaPause,
  FaPlay,
  FaSpinner,
  FaStepForward,
  FaStop,
  FaSyncAlt,
  FaTrashAlt
} from 'react-icons/fa'
import Swal from 'sweetalert2'
import { useCrawler } from '../hooks/useCrawler'
import { createLogger } from '../utils/logger'
import './SidePanel.scss'

const logger = createLogger('SidePanel')

export const SidePanel = () => {
  const autoCrawlNotificationShownRef = useRef(false)
  const {
    creatorIds,
    setCreatorIds,
    notFoundCreators,
    processCount,
    crawledCount,
    crawlProgress,
    crawlDuration,
    useApi,
    setUseApi,
    isCrawling,
    canContinue,
    isAutoCrawling,
    isDisabled,
    totalIds,
    hasCrawledData,
    hasNotFoundData,
    fileInputRef,
    handleFileChange,
    handleOpenOptionsPage,
    handleStartCrawl,
    handleContinueCrawl,
    handleStopCrawl,
    handleResetCrawl,
    handleExportCrawledCreators,
    handleExportNotFoundCreators,
    handleToggleAutoCrawl
  } = useCrawler()

  useEffect(() => {
    if (!autoCrawlNotificationShownRef.current) {
      autoCrawlNotificationShownRef.current = true
      logger.info('Showing auto-crawl notification')

      // Create a countdown alert that updates every second
      const timerDuration = 30 // seconds
      let timerInterval: NodeJS.Timeout

      Swal.fire({
        title: 'Auto Crawling',
        html: `Auto crawling will start in <b>${timerDuration}</b> seconds. Do you want to proceed?`,
        icon: 'question',
        timer: timerDuration * 1000,
        timerProgressBar: true,
        showCancelButton: true,
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel auto crawling',
        allowOutsideClick: false,
        didOpen: () => {
          // Update the timer every second
          let secondsLeft = timerDuration
          const timerElement = Swal.getHtmlContainer()?.querySelector('b')

          timerInterval = setInterval(() => {
            secondsLeft -= 1
            if (timerElement) {
              timerElement.textContent = secondsLeft.toString()
            }
          }, 1000)
        },
        willClose: () => {
          clearInterval(timerInterval)
        }
      }).then((result) => {
        if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
          // Start auto crawling if confirmed or timer expired
          logger.info('Auto crawl approved, starting crawl process')
          handleToggleAutoCrawl()
        } else {
          // User canceled auto crawling
          logger.info('Auto crawl canceled by user')
        }
      })
    }
  }, [])

  return (
    <main className="side-panel">
      <header className="panel-header">
        <h3 className="panel-title">TikTok Creator Data Crawler</h3>
        <div className="panel-stats">
          {hasCrawledData && <span className="panel-stats__item">Crawled: {crawledCount}</span>}
          {hasNotFoundData && <span className="panel-stats__item">Not Found: {notFoundCreators.length}</span>}
        </div>
      </header>

      {/* Input Area */}
      <div className="panel-card panel-input">
        <label htmlFor="creatorIds" className="panel-input__label">
          Creator IDs ({totalIds}):
          <div className="panel-input__actions">
            <button
              className={`icon-button ${isDisabled ? 'icon-button--disabled' : ''}`}
              disabled={isDisabled}
              title="Upload a text file (.txt) with creator IDs (one ID per line)"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaFileUpload />
            </button>
            <button className="icon-button" title="Open Options Page" type="button" onClick={handleOpenOptionsPage}>
              <FaCog />
            </button>
          </div>
        </label>
        <textarea
          className={`panel-input__textarea ${isDisabled ? 'disabled' : ''}`}
          id="creatorIds"
          disabled={isDisabled}
          value={creatorIds.join('\n')}
          placeholder="Enter creator IDs, each on a new line, or use 'Upload File' / 'Use API'."
          onChange={(e) => {
            const newIds = e.target.value.split('\n')
            setCreatorIds(newIds)
            if (!useApi) {
              chrome.storage.local.set({ creatorIds: newIds })
            }
          }}
        />
        <input
          ref={fileInputRef}
          id="fileInput"
          disabled={isDisabled}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Button Area */}
      <div className="panel-section-header">
        <h4 className="section-title">Crawler Actions</h4>
      </div>

      <div className="panel-card panel-buttons">
        {/* Toggle Auto Crawl */}
        <button
          className={`button button-with-indicator ${isAutoCrawling ? 'button--active' : ''}`}
          onClick={handleToggleAutoCrawl}
        >
          <span className={`status-indicator ${isAutoCrawling ? 'status-indicator--active' : ''}`}></span>
          {isAutoCrawling ? (
            <>
              Stop Auto Crawl <FaStop />
            </>
          ) : (
            <>
              Start Auto Crawl <FaSyncAlt />
            </>
          )}
        </button>
        {isAutoCrawling && (
          <div className="auto-crawl-loading">
            Auto Crawling Active <FaSpinner className="spinner" />
          </div>
        )}

        {/* Start Manual Crawl */}
        <div className="start-group">
          <button
            className={`button ${isCrawling || canContinue || isAutoCrawling || totalIds === 0 ? 'button--disabled' : ''}`}
            disabled={isCrawling || canContinue || isAutoCrawling || totalIds === 0}
            title={totalIds === 0 ? 'Please load Creator IDs first' : 'Start a new crawl (clears previous data)'}
            onClick={handleStartCrawl}
          >
            Start Crawling <FaPlay />
          </button>

          <label
            className="api-toggle"
            title="Fetch IDs from API URL (defined in options) instead of using the text area/file upload."
          >
            <input
              type="checkbox"
              checked={useApi}
              onChange={(e) => setUseApi(e.target.checked)}
              disabled={isDisabled}
            />
            Use API
          </label>
        </div>

        {/* Continue Manual Crawl */}
        <button
          className={`button ${!canContinue || isAutoCrawling ? 'button--disabled' : ''}`}
          disabled={!canContinue || isAutoCrawling}
          title={!canContinue ? 'No crawl to continue or crawl finished' : 'Continue the previously stopped crawl'}
          onClick={handleContinueCrawl}
        >
          Continue Crawling <FaStepForward />
        </button>

        {/* Stop (Pause) Manual Crawl */}
        <button
          className={`button ${!isCrawling || isAutoCrawling ? 'button--disabled' : ''}`}
          disabled={!isCrawling || isAutoCrawling}
          title={
            !isCrawling
              ? 'No manual crawl is currently running'
              : 'Stop the current manual crawl (can be continued later)'
          }
          onClick={handleStopCrawl}
        >
          Stop Crawling <FaPause />
        </button>

        {/* Reset Crawl */}
        <button
          className={`button ${isDisabled ? 'button--disabled' : ''}`}
          disabled={isDisabled}
          title="Clear all stored crawl data and reset progress"
          onClick={handleResetCrawl}
        >
          Reset Crawl <FaTrashAlt />
        </button>

        {/* Export Section */}
        <div className="panel-section-header export-section-header">
          <h4 className="section-title">Export Data</h4>
        </div>

        <div className="export-buttons">
          {/* Export Crawled Data */}
          <button
            className={`button ${isDisabled || !hasCrawledData ? 'button--disabled' : ''}`}
            disabled={isDisabled || !hasCrawledData}
            title={!hasCrawledData ? 'No crawled data available to export' : 'Export crawled creator data as JSON'}
            onClick={handleExportCrawledCreators}
          >
            Export Crawled ({crawledCount}) <FaFileDownload />
          </button>

          {/* Export Not Found Data */}
          {hasNotFoundData && (
            <button
              className={`button ${isDisabled ? 'button--disabled' : ''}`}
              disabled={isDisabled}
              title="Export list of creator IDs that were not found"
              onClick={handleExportNotFoundCreators}
            >
              Export Not Found ({notFoundCreators.length}) <FaFileDownload />
            </button>
          )}
        </div>
      </div>

      {(isCrawling || crawlProgress > 0 || canContinue || hasCrawledData || hasNotFoundData) && (
        <hr className="separator" />
      )}

      {/* Progress Area */}
      {(isCrawling || crawlProgress > 0 || canContinue) && (
        <div className="panel-card panel-progress">
          <label htmlFor="crawler-progress" className="panel-progress__label">
            Crawling Progress:
          </label>
          <progress id="crawler-progress" value={crawlProgress} max="100" className="panel-progress__bar" />
          <span className="panel-progress__percentage">{crawlProgress}%</span>
        </div>
      )}

      {/* Status Info */}
      {(isCrawling || crawlProgress > 0 || canContinue || hasCrawledData) && (
        <div className="panel-card panel-status">
          <span>
            Processed: {processCount} / {totalIds}
          </span>
          {crawlDuration && <span>Duration: {crawlDuration}</span>}
        </div>
      )}

      {/* Not Found Area */}
      {hasNotFoundData && !isCrawling && (
        <>
          <div className="panel-card panel-not-found">
            <h4 className="panel-not-found__title">Not Found IDs ({notFoundCreators.length})</h4>
            <ul className="panel-not-found__list">
              {notFoundCreators.map((id, index) => (
                <li key={index}>{id}</li>
              ))}
            </ul>
          </div>
        </>
      )}
    </main>
  )
}
