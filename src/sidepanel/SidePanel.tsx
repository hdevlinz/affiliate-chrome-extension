import { useEffect, useRef, useState } from 'react'
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
import { ActionType } from '../types/enums'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { formatSeconds, getFormattedDate } from '../utils/formatters'
import { exportFile } from '../utils/helpers'
import { logger } from '../utils/logger'
import { swal } from '../utils/swal'
import './SidePanel.scss'

export const SidePanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const autoCrawlIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [creatorIds, setCreatorIds] = useState<string[]>([])
  const [notFoundCreators, setNotFoundCreators] = useState<string[]>([])
  const [processCount, setProcessCount] = useState(0)
  const [crawledCount, setCrawledCount] = useState(0)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawlDuration, setCrawlDuration] = useState<string | null>(null)
  const [crawlIntervalDuration, setCrawlIntervalDuration] = useState<number>(120)
  const [useApi, setUseApi] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const [isAutoCrawling, setIsAutoCrawling] = useState(false)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (isNullOrUndefined(file)) {
      swal.error('File Error', 'No file selected.')

      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string | undefined
      if (typeof fileContent !== 'string') {
        swal.error('File Error', 'Failed to read file content.')

        return
      }

      const ids = fileContent
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      setCreatorIds(ids)
      swal.success('File Loaded', `Successfully loaded ${ids.length} creator IDs from the file.`)
    }
    reader.onerror = () => swal.error('File Error', 'An error occurred while reading the file.')
    reader.readAsText(file)

    if (event.target) {
      event.target.value = ''
    }
  }

  const handleOpenOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage()
    } else {
      window.open(chrome.runtime.getURL('templates/options.html'))
    }
  }

  const startCrawl = async (validIds: string[]) => {
    logger.info('Starting crawl with IDs:', validIds)
    setIsCrawling(true)
    setCanContinue(false)
    setCrawlProgress(0)
    setCrawledCount(0)
    setCrawlDuration(null)
    setNotFoundCreators([])

    await chrome.storage.local.remove([
      'processCount',
      'crawlDurationSeconds',
      'crawledCreators',
      'notFoundCreators',
      'currentCreatorIndex'
    ])

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (isNullOrUndefined(tabs[0]?.id)) {
      await chrome.storage.local.set({ isCrawling: false })
      setIsCrawling(false)

      logger.error('No active tab found to start crawl.')
      swal.error('Tab Error', 'Could not find the active tab to start crawling.')

      return
    }

    try {
      await chrome.tabs.sendMessage(tabs[0].id, {
        action: ActionType.START_CRAWLING,
        useApi,
        startTime: Date.now(),
        creatorIds: validIds
      })
      logger.info('START_CRAWLING message sent successfully.')
    } catch (error) {
      await chrome.storage.local.set({ isCrawling: false })
      setIsCrawling(false)

      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error sending START_CRAWLING message:', error)
      swal.error(
        'Communication Error',
        `Failed to communicate with the content script. Ensure you are on a TikTok page and try refreshing the extension/page. Error: ${errorMessage}`
      )
    }
  }

  const handleStartCrawl = async () => {
    const validIds = creatorIds.map((id) => id.trim()).filter(Boolean)
    if (isEmptyArray(validIds)) {
      swal.error('Crawl Error', 'Please enter or upload creator IDs before starting.')

      return
    }

    const { crawledCreators } = await chrome.storage.local.get(['crawledCreators'])
    if (isNullOrUndefined(crawledCreators) || isEmptyArray(crawledCreators)) {
      logger.info('No previous data found. Starting new crawl.')
      startCrawl(validIds)

      return
    }

    logger.warn('Previous crawl data detected. Asking for confirmation.')
    swal
      .warning(
        'Warning',
        'Starting a new crawl will clear all previously crawled data. Are you sure you want to proceed?'
      )
      .then((result) => {
        if (!result.isConfirmed) {
          return
        }

        logger.info('User confirmed overwrite. Starting new crawl.')
        startCrawl(validIds)
      })
  }

  const handleContinueCrawl = async () => {
    logger.info('Attempting to continue crawl.')
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (isNullOrUndefined(tabs[0]?.id)) {
      logger.error('No active tab found to continue crawl.')
      swal.error('Tab Error', 'Could not find the active tab to continue crawling.')

      return
    }

    setIsCrawling(true)
    setCanContinue(false)

    await chrome.storage.local.set({ isCrawling: true })
    try {
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.CONTINUE_CRAWLING })
      logger.info('CONTINUE_CRAWLING message sent successfully.')
    } catch (error) {
      await chrome.storage.local.set({ isCrawling: false })
      setIsCrawling(false)
      setCanContinue(true)

      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error sending CONTINUE_CRAWLING message:', error)
      swal.error('Communication Error', `Failed to communicate with the content script. Error: ${errorMessage}`)
    }
  }

  const handleStopCrawl = async () => {
    logger.info('Attempting to stop crawl.')
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    if (isNullOrUndefined(tabs[0]?.id)) {
      await chrome.storage.local.set({ isCrawling: false })
      const { currentCreatorIndex: currentIdxBeforeStop, creatorIds: storedIdsBeforeStop } =
        await chrome.storage.local.get(['currentCreatorIndex', 'creatorIds'])
      const totalCountBeforeStop = storedIdsBeforeStop?.length ?? 0
      const canStillContinueBeforeStop =
        !isNullOrUndefined(currentIdxBeforeStop) && currentIdxBeforeStop < totalCountBeforeStop
      setIsCrawling(false)
      setCanContinue(canStillContinueBeforeStop)

      logger.warn('No active tab found to send STOP_CRAWLING message, stopping locally.')
      swal.error('Tab Error', 'Could not find the active tab to stop crawling.')

      return
    }

    setIsCrawling(false)
    const { currentCreatorIndex, creatorIds: storedIds } = await chrome.storage.local.get([
      'currentCreatorIndex',
      'creatorIds'
    ])
    const totalCount = storedIds?.length ?? 0
    const canStillContinue = !isNullOrUndefined(currentCreatorIndex) && currentCreatorIndex < totalCount
    setCanContinue(canStillContinue)

    await chrome.storage.local.set({ isCrawling: false })
    try {
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.STOP_CRAWLING })
      logger.info('STOP_CRAWLING message sent successfully.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error sending STOP_CRAWLING message:', error)
      swal.error(
        'Communication Error',
        `Failed to send stop signal to the content script, but crawl stopped locally. Error: ${errorMessage}`
      )
    }
  }

  const handleResetCrawl = async () => {
    logger.warn('Reset crawl requested. Asking for confirmation.')
    swal
      .warning(
        'Warning',
        'Resetting the crawl will clear all crawled data and stop the current process. Are you sure you want to proceed?'
      )
      .then(async (result) => {
        if (!result.isConfirmed) {
          return
        }

        logger.info('User confirmed reset.')
        if (isAutoCrawling) {
          setIsAutoCrawling(false)
          if (autoCrawlIntervalRef.current) {
            clearInterval(autoCrawlIntervalRef.current)
            autoCrawlIntervalRef.current = null
          }
        }

        setUseApi(false)
        setIsCrawling(false)
        setCanContinue(false)
        setCrawlProgress(0)
        setCrawledCount(0)
        setCrawlDuration(null)
        setCreatorIds([])
        setNotFoundCreators([])

        await chrome.storage.local.remove([
          'useApi',
          'isCrawling',
          'processCount',
          'crawlDurationSeconds',
          'creatorIds',
          'crawledCreators',
          'notFoundCreators',
          'currentCreatorIndex'
        ])
        logger.info('Local storage cleared for crawl data.')

        const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
        if (isNullOrUndefined(tabs[0]?.id)) {
          logger.warn('No active tab found to send RESET_CRAWLING message, resetting locally.')
          await swal.success('Crawl Reset', 'The crawl has been reset successfully.')

          return
        }

        try {
          await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.RESET_CRAWLING })
          logger.info('RESET_CRAWLING message sent successfully.')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error('Error sending RESET_CRAWLING message:', error)
          swal.error(
            'Communication Error',
            `Failed to send reset signal to the content script, but crawl data reset locally. Error: ${errorMessage}`
          )
        }

        await swal.success('Crawl Reset', 'The crawl has been reset successfully.')
      })
  }

  const handleExportCrawledCreators = async () => {
    const { crawledCreators } = await chrome.storage.local.get(['crawledCreators'])
    if (isEmptyArray(crawledCreators)) {
      swal.error('Export Error', 'No data to export.')

      return
    }

    logger.info(`Exporting ${crawledCreators.length} crawled creators.`)
    const data = JSON.stringify(crawledCreators, null, 2)
    const filename = `tiktok_crawled_creators_${getFormattedDate()}.json`
    exportFile(data, filename, 'application/json')
  }

  const handleExportNotFoundCreators = async () => {
    if (isEmptyArray(notFoundCreators)) {
      swal.error('Export Error', 'No data to export.')

      return
    }

    logger.info(`Exporting ${notFoundCreators.length} not found creators.`)
    const data = notFoundCreators.join('\n')
    const filename = `tiktok_not_found_creators_${getFormattedDate()}.txt`
    exportFile(data, filename, 'text/plain')
  }

  const handleFetchAPI = async (): Promise<string[] | undefined> => {
    const syncResult = await chrome.storage.sync.get(['creatorIdsEndpoint', 'apiKeyFormat', 'apiKeyValue'])
    if (isEmpty(syncResult.creatorIdsEndpoint)) {
      logger.error('API Error: Get Creator IDs URL is not set.')
      swal.error('API Error', 'Get Creator IDs URL is not set in settings.').then(() => setUseApi(false))

      return undefined
    }

    swal.info('Fetching Creator IDs', 'Please wait...', {
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    })

    try {
      logger.info(`Fetching creator IDs from: ${syncResult.creatorIdsEndpoint}`)
      const headers: HeadersInit = {}
      if (syncResult.mdApiKeyFormat && syncResult.mdApiKeyValue) {
        headers[syncResult.mdApiKeyFormat] = syncResult.mdApiKeyValue
        logger.info('Using API Key for fetch.')
      }

      const response = await fetch(syncResult.creatorIdsEndpoint, {
        method: 'GET',
        headers: headers
      })

      if (!response.ok) {
        setUseApi(false)

        const errorText = await response.text()
        logger.error(`API Error ${response.status}: Failed to fetch creator IDs. Response: ${errorText}`)
        swal.error('API Error', `Failed to fetch creator IDs. Status: ${response.status}. Check console for details.`)

        return undefined
      }

      const jsonData = await response.json()
      if (!Array.isArray(jsonData)) {
        setUseApi(false)

        logger.error('API Error: Response is not a JSON array.')
        swal.error('API Error', 'Invalid data format received from API (expected an array).')

        return undefined
      }

      const extractedCreatorIds = jsonData
        .map((creator: any) => creator?.id)
        .filter((id): id is string => typeof id === 'string' && id.trim() !== '')

      if (isEmptyArray(extractedCreatorIds)) {
        setUseApi(false)

        logger.warn('API Warning: No valid creator IDs found in the API response.')
        swal.error('API Error', 'No valid creator IDs were found in the API response.')

        return undefined
      }

      await chrome.storage.local.set({ creatorIds: extractedCreatorIds })
      setCreatorIds(extractedCreatorIds)

      logger.info(`Fetched ${extractedCreatorIds.length} creator IDs.`)
      swal.success('Creator IDs Fetched', `Successfully fetched ${extractedCreatorIds.length} creator IDs.`)

      return extractedCreatorIds
    } catch (error: any) {
      setUseApi(false)

      logger.error('Error fetching creator IDs:', error)
      swal.error('API Error', `An error occurred while trying to fetch creator IDs: ${error.message}`)

      return undefined
    }
  }

  const performAutoCrawlCycle = async () => {
    const { isCrawling: currentlyCrawling } = await chrome.storage.local.get(['isCrawling'])
    if (currentlyCrawling) {
      logger.info('Auto-crawl cycle skipped: A crawl is already in progress.')

      return
    }

    logger.info('Performing auto-crawl cycle: Fetching IDs...')

    const fetchedIds = await handleFetchAPI()
    if (isNullOrUndefined(fetchedIds) || isEmptyArray(fetchedIds)) {
      setIsAutoCrawling(false)
      logger.warn('Auto-crawl cycle: Failed to fetch or no IDs returned from API. Stopping auto-crawl.')

      return
    }

    const validIds = fetchedIds.map((id: string) => id.trim()).filter(Boolean)
    if (isEmptyArray(validIds)) {
      logger.warn('Auto-crawl cycle: No valid IDs after filtering fetched data. Stopping auto-crawl.')
      setIsAutoCrawling(false)

      return
    }

    logger.info('Auto-crawl cycle: Starting crawl with fetched IDs.')
    await startCrawl(validIds)
  }

  useEffect(() => {
    const initializeState = async () => {
      logger.debug('Initializing component state from storage.')
      const localResult = await chrome.storage.local.get(null)
      const syncResult = await chrome.storage.sync.get(['crawlIntervalDuration'])

      const storedCreatorIds = localResult.creatorIds || []
      const totalCreatorIdsCount = storedCreatorIds.length
      const currentIdx = localResult.currentCreatorIndex
      const processCnt = localResult.processCount ?? 0
      const crawledCreatorsCount = localResult.crawledCreators?.length ?? 0

      const initialIsCrawling = !!localResult.isCrawling
      const initialCanContinue =
        !initialIsCrawling &&
        !isNullOrUndefined(currentIdx) &&
        currentIdx < totalCreatorIdsCount &&
        totalCreatorIdsCount > 0
      const initialProgress = totalCreatorIdsCount > 0 ? Math.round((processCnt / totalCreatorIdsCount) * 100) : 0
      const initialNotFound = localResult.notFoundCreators || []

      setUseApi(!!localResult.useApi)
      setIsCrawling(initialIsCrawling)
      setCanContinue(initialCanContinue)
      setCrawlProgress(initialProgress)
      setProcessCount(processCnt)
      setCrawledCount(crawledCreatorsCount)
      setCrawlDuration(formatSeconds(localResult.crawlDurationSeconds))
      setCreatorIds(storedCreatorIds)
      setNotFoundCreators(initialNotFound)
      setCrawlIntervalDuration(syncResult.crawlIntervalDuration || 120)

      logger.debug('Initial state set:', {
        useApi: !!localResult.useApi,
        isCrawling: initialIsCrawling,
        canContinue: initialCanContinue,
        progress: initialProgress,
        crawledCount: crawledCreatorsCount,
        duration: formatSeconds(localResult.crawlDurationSeconds),
        idsCount: totalCreatorIdsCount,
        notFoundCount: initialNotFound.length,
        intervalDuration: syncResult.crawlIntervalDuration || 120
      })
    }

    initializeState()

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      logger.debug(`Storage changed in area: ${areaName}`, changes)
      if (areaName === 'local') {
        if (changes.useApi) setUseApi(!!changes.useApi.newValue)
        if (changes.isCrawling) setIsCrawling(!!changes.isCrawling.newValue)
        if (changes.creatorIds) setCreatorIds(changes.creatorIds.newValue || [])
        if (changes.crawledCreators) setCrawledCount((changes.crawledCreators.newValue || []).length)
        if (changes.notFoundCreators) setNotFoundCreators(changes.notFoundCreators.newValue || [])
        if (changes.crawlDurationSeconds) setCrawlDuration(formatSeconds(changes.crawlDurationSeconds.newValue))

        chrome.storage.local
          .get(['isCrawling', 'creatorIds', 'currentCreatorIndex', 'processCount'])
          .then((localResult) => {
            const currentIsCrawling = !!localResult.isCrawling
            const currentIds = localResult.creatorIds || []
            const totalCount = currentIds.length
            const currentIdx = localResult.currentCreatorIndex
            const processCnt = localResult.processCount ?? 0

            setProcessCount(processCnt)

            const updatedCanContinue =
              !currentIsCrawling && !isNullOrUndefined(currentIdx) && currentIdx < totalCount && totalCount > 0
            setCanContinue(updatedCanContinue)

            const calculatedProgress = totalCount > 0 ? Math.round((processCnt / totalCount) * 100) : 0
            setCrawlProgress(calculatedProgress)

            logger.debug('Local storage change applied to state (recalculated).')
          })
      } else if (areaName === 'sync' && changes.crawlIntervalDuration) {
        const newInterval = changes.crawlIntervalDuration.newValue || 120
        setCrawlIntervalDuration(newInterval)
        logger.info(`Crawl interval duration updated from sync storage: ${newInterval} seconds.`)
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      logger.debug('Removing storage change listener.')
      chrome.storage.onChanged.removeListener(handleStorageChange)
      if (autoCrawlIntervalRef.current) {
        clearInterval(autoCrawlIntervalRef.current)
        autoCrawlIntervalRef.current = null
        logger.info('Cleared auto-crawl interval on unmount.')
      }
    }
  }, [])

  useEffect(() => {
    chrome.storage.local.set({ useApi })
    if (useApi && !isCrawling && !isAutoCrawling) {
      logger.info('useApi toggled on. Fetching IDs...')
      handleFetchAPI()
    } else if (!useApi) {
      logger.info('useApi toggled off.')
    }
  }, [useApi])

  useEffect(() => {
    const clearExistingInterval = () => {
      if (autoCrawlIntervalRef.current) {
        clearInterval(autoCrawlIntervalRef.current)
        logger.info('Cleared existing auto-crawl interval.')
        autoCrawlIntervalRef.current = null
      }
    }

    if (isAutoCrawling) {
      if (!useApi) {
        logger.warn("Auto-crawling started but 'Use API' is not enabled. Enabling it.")
        setUseApi(true) // The `useApi` effect will trigger the initial fetch
      } else {
        // If API is already enabled, perform the first cycle immediately
        logger.info(`Starting auto-crawl interval. Duration: ${crawlIntervalDuration} seconds.`)
        clearExistingInterval()
        performAutoCrawlCycle()
        autoCrawlIntervalRef.current = setInterval(performAutoCrawlCycle, crawlIntervalDuration * 1000)
      }
    } else {
      logger.info('Stopping auto-crawl interval.')
      clearExistingInterval()
    }

    // Cleanup function to clear interval when isAutoCrawling becomes false or component unmounts
    return clearExistingInterval
  }, [isAutoCrawling, crawlIntervalDuration, useApi])

  const handleToggleAutoCrawl = () => {
    setIsAutoCrawling((prev) => {
      const newState = !prev
      if (newState) {
        swal.info('Auto Crawl Started', 'The auto crawl cycle will now run periodically.')
        logger.info('User started auto-crawling.')
      } else {
        swal.info('Auto Crawl Stopped', 'The auto crawl cycle has been stopped.')
        logger.info('User stopped auto-crawling.')
      }
      return newState
    })
  }

  const isDisabled = isCrawling || isAutoCrawling
  const totalIds = creatorIds.filter(Boolean).length
  const hasCrawledData = crawledCount > 0
  const hasNotFoundData = !isEmptyArray(notFoundCreators)

  return (
    <main className="side-panel">
      <h3 className="panel-title">TikTok Creator Data Crawler</h3>

      {/* Input Area */}
      <div className="panel-input">
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
      <div className="panel-buttons">
        {/* Toggle Auto Crawl */}
        <button className={`button`} onClick={handleToggleAutoCrawl}>
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
            Export Not Found ({notFoundCreators.length}) <FaFileDownload />{' '}
          </button>
        )}
      </div>

      {(isCrawling || crawlProgress > 0 || canContinue || hasCrawledData || hasNotFoundData) && (
        <hr className="separator" />
      )}

      {/* Progress Area */}
      {(isCrawling || crawlProgress > 0 || canContinue) && (
        <div className="panel-progress">
          <label htmlFor="crawler-progress" className="panel-progress__label">
            Crawling Progress:
          </label>
          <progress id="crawler-progress" value={crawlProgress} max="100" className="panel-progress__bar" />
          <span className="panel-progress__percentage">{crawlProgress}%</span>
        </div>
      )}

      {/* Status Info */}
      {(isCrawling || crawlProgress > 0 || canContinue || hasCrawledData) && (
        <div className="panel-status">
          <span>
            Processed: {processCount} / {totalIds}
          </span>
          {crawlDuration && <span>Duration: {crawlDuration}</span>}
        </div>
      )}

      {/* Not Found Area */}
      {hasNotFoundData && !isCrawling && (
        <>
          <div className="panel-not-found">
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

export default SidePanel
