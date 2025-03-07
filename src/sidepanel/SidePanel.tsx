import { useEffect, useRef, useState } from 'react'
import { FaCog, FaFileExport, FaFileUpload, FaPlay, FaStop, FaSync } from 'react-icons/fa'
import { ActionType } from '../types/enums'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { formatSeconds, getFormattedDate } from '../utils/formatters'
import { exportFile } from '../utils/helpers'
import { logger } from '../utils/logger'
import { swal } from '../utils/swal'
import './SidePanel.css'

export const SidePanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [useApi, setUseApi] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawledCount, setCrawledCount] = useState(0)
  const [crawlDuration, setCrawlDuration] = useState<string | null>(null)
  const [creatorIds, setCreatorIds] = useState<string[]>([])
  const [notFoundCreators, setNotFoundCreators] = useState<string[]>([])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (isNullOrUndefined(file)) return swal.error('File Error', 'No file selected.')

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string | undefined
      if (typeof fileContent !== 'string') return swal.error('File Error', 'Failed to read file content.')

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
  }

  const handleOpenOptionsPage = () => {
    if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage()
    else window.open(chrome.runtime.getURL('templates/options.html'))
  }

  const handleStartCrawl = async () => {
    const validIds = creatorIds.filter(Boolean)
    if (isEmptyArray(validIds)) return swal.error('Crawl Error', 'Please enter or upload creator IDs before starting.')

    chrome.storage.local.get(['crawledCreators'], async ({ crawledCreators }) => {
      if (isNullOrUndefined(crawledCreators) || isEmptyArray(crawledCreators)) return startCrawl(validIds)

      return swal
        .warning(
          'Warning',
          'Starting a new crawl will clear all previously crawled data. Are you sure you want to proceed?'
        )
        .then((result) => result.isConfirmed && startCrawl(validIds))
    })
  }

  const startCrawl = (validIds: string[]) => {
    setIsCrawling(true)
    setCanContinue(false)
    setCrawlProgress(0)
    setCrawledCount(0)
    setCrawlDuration(null)
    setNotFoundCreators([])

    chrome.storage.local.remove(
      ['processCount', 'crawlDurationSeconds', 'crawledCreators', 'notFoundCreators', 'currentCreatorIndex'],
      () => {
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (isNullOrUndefined(tabs[0].id)) return setIsCrawling(false)

          await chrome.storage.local.set({ isCrawling: true, creatorIds: validIds })
          await chrome.tabs.sendMessage(tabs[0].id, {
            action: ActionType.START_CRAWLING,
            useApi,
            startTime: Date.now(),
            creatorIds: validIds
          })
        })
      }
    )
  }

  const handleContinueCrawl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (isNullOrUndefined(tabs[0].id)) return

      setIsCrawling(true)
      setCanContinue(false)

      await chrome.storage.local.set({ isCrawling: true })
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.CONTINUE_CRAWLING })
    })
  }

  const handleStopCrawl = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (isNullOrUndefined(tabs[0].id)) return

      setIsCrawling(false)
      setCanContinue(true)

      await chrome.storage.local.set({ isCrawling: false })
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.STOP_CRAWLING })
    })
  }

  const handleResetCrawl = async () => {
    return swal
      .warning(
        'Warning',
        'Resetting the crawl will clear all crawled data and stop the current process. Are you sure you want to proceed?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          setUseApi(false)
          setIsCrawling(false)
          setCanContinue(false)
          setCrawlProgress(0)
          setCrawledCount(0)
          setCrawlDuration(null)
          setCreatorIds([])
          setNotFoundCreators([])

          chrome.storage.local.remove(
            [
              'useApi',
              'isCrawling',
              'processCount',
              'crawlDurationSeconds',
              'creatorIds',
              'crawledCreators',
              'notFoundCreators',
              'currentCreatorIndex'
            ],
            () => {
              chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
                if (isNullOrUndefined(tabs[0].id)) return

                await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.RESET_CRAWLING })
                swal.success('Crawl Reset', 'The crawl has been reset successfully.')
              })
            }
          )
        }
      })
  }

  const handleExportCrawledCreators = () => {
    chrome.storage.local.get(['crawledCreators'], ({ crawledCreators }) => {
      if (isEmptyArray(crawledCreators)) return swal.error('Export Error', 'No data to export.')

      const data = JSON.stringify(crawledCreators, null, 2)
      const filename = `tiktok_crawled_creators_${getFormattedDate()}.json`
      exportFile(data, filename, 'application/json')
    })
  }

  const handleExportNotFoundCreators = () => {
    if (isEmptyArray(notFoundCreators)) return swal.error('Export Error', 'No data to export.')

    const data = notFoundCreators.join('\n')
    const filename = `tiktok_not_found_creators_${getFormattedDate()}.txt`
    exportFile(data, filename, 'text/plain')
  }

  const handleFetchAPI = async () => {
    chrome.storage.sync.get(null, async (syncResult) => {
      if (isEmpty(syncResult.mdCreatorIdsUrl)) {
        return swal.error('API Error', 'Get Creator IDs URL is not set.').then(() => setUseApi(false))
      }

      swal.info('Fetching Creator IDs', 'Please wait...', {
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      })

      const headers =
        syncResult.mdApiKeyFormat && syncResult.mdApiKeyValue
          ? {
              [syncResult.mdApiKeyFormat]: syncResult.mdApiKeyValue
            }
          : {}

      try {
        const response = await fetch(syncResult.mdCreatorIdsUrl, {
          method: 'GET',
          headers
        })

        if (!response.ok) {
          return swal.error('API Error', 'Failed to fetch creator IDs from the API.').then(() => setUseApi(false))
        }

        const jsonData = await response.json()
        if (isEmptyArray(jsonData)) {
          return swal.error('API Error', 'No creator IDs were fetched from the API.').then(() => setUseApi(false))
        }

        const extractedCreatorIds = jsonData.map((creator: any) => creator.id)
        setCreatorIds(extractedCreatorIds)
        swal.success('Creator IDs Fetched', `Successfully fetched ${extractedCreatorIds.length} creator IDs.`)
      } catch (error) {
        logger.error('Error fetching creator IDs:', error)
        swal
          .error('API Error', 'An error occurred while trying to fetch creator IDs from the API.')
          .then(() => setUseApi(false))
      }
    })
  }

  useEffect(() => {
    chrome.storage.local.set({ useApi })

    if (useApi) handleFetchAPI()
  }, [useApi])

  useEffect(() => {
    chrome.storage.local.get(null, (localResult) => {
      const totalCreatorIdsCount = isEmptyArray(localResult.creatorIds) ? 0 : localResult.creatorIds.length
      const storedCanContinue =
        !!!localResult.isCrawling &&
        !isNullOrUndefined(localResult.currentCreatorIndex) &&
        localResult.currentCreatorIndex < totalCreatorIdsCount
      const crawledCreatorsCount = isEmptyArray(localResult.crawledCreators) ? 0 : localResult.crawledCreators.length
      const calculatedProgress =
        totalCreatorIdsCount > 0 && !isNullOrUndefined(localResult.processCount)
          ? Math.round((localResult.processCount / totalCreatorIdsCount) * 100)
          : 0

      setUseApi(!!localResult.useApi)
      setIsCrawling(!!localResult.isCrawling)
      setCanContinue(storedCanContinue)
      setCrawlProgress(calculatedProgress)
      setCrawledCount(crawledCreatorsCount)
      setCrawlDuration(formatSeconds(localResult.crawlDurationSeconds))
      setCreatorIds(localResult.creatorIds || [])
      setNotFoundCreators(localResult.notFoundCreators || [])
    })

    const updateStateFromStorage = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName === 'local') {
        chrome.storage.local.get(null, (localResult) => {
          const totalCreatorIdsCount = isEmptyArray(localResult.creatorIds) ? 0 : localResult.creatorIds.length

          if (changes.useApi) setUseApi(!!localResult.useApi)

          if (changes.isCrawling) setIsCrawling(!!localResult.isCrawling)

          if (changes.currentCreatorIndex) {
            const storedCanContinue =
              !!!localResult.isCrawling &&
              !isNullOrUndefined(localResult.currentCreatorIndex) &&
              localResult.currentCreatorIndex < totalCreatorIdsCount
            setCanContinue(storedCanContinue)
          }

          if (changes.processCount) {
            const calculatedProgress =
              totalCreatorIdsCount > 0 && !isNullOrUndefined(localResult.processCount)
                ? Math.round((localResult.processCount / totalCreatorIdsCount) * 100)
                : 0
            setCrawlProgress(calculatedProgress)
          }

          if (changes.crawledCreators) {
            setCrawledCount(isEmptyArray(localResult.crawledCreators) ? 0 : localResult.crawledCreators.length)
          }

          if (changes.crawlDurationSeconds) setCrawlDuration(formatSeconds(localResult.crawlDurationSeconds))

          if (changes.creatorIds) setCreatorIds(localResult.creatorIds || [])

          if (changes.notFoundCreators) setNotFoundCreators(localResult.notFoundCreators || [])
        })
      }
    }

    chrome.storage.onChanged.addListener(updateStateFromStorage)

    return () => chrome.storage.onChanged.removeListener(updateStateFromStorage)
  }, [])

  return (
    <main className="side-panel-container">
      <h3 className="title">TikTok Creator Data Crawler</h3>
      <div className="input-area">
        <label htmlFor="creatorIds" className="input-label">
          Creator IDs:
          <div className="input-actions">
            <button
              className={`icon-button ${isCrawling ? 'disabled' : ''}`}
              disabled={isCrawling}
              title="Upload a text file (.txt) with creator IDs (one ID per line)"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              <FaFileUpload className={`${isCrawling ? 'disabled' : ''}`} />
            </button>
            <button className="icon-button" title="Open Options Page" type="button" onClick={handleOpenOptionsPage}>
              <FaCog />
            </button>
          </div>
        </label>
        <textarea
          className={`creator-ids-textarea ${isCrawling ? 'disabled' : ''}`}
          id="creatorIds"
          disabled={isCrawling}
          value={creatorIds.join('\n')}
          placeholder="Enter creator IDs, each on a new line"
          onChange={(e) => setCreatorIds(e.target.value.split('\n'))}
        />
        <input
          ref={fileInputRef}
          id="fileInput"
          disabled={isCrawling}
          type="file"
          accept=".txt"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      <div className="button-area">
        <div className="start-button-container">
          <button
            className={`button start-button ${isCrawling || canContinue ? 'disabled' : ''}`}
            disabled={isCrawling || canContinue}
            onClick={handleStartCrawl}
          >
            Start Crawling <FaPlay />
          </button>

          <label className="api-checkbox">
            <input
              type="checkbox"
              checked={useApi}
              onChange={(e) => setUseApi(e.target.checked)}
              disabled={isCrawling || canContinue}
            />
            Use API
          </label>
        </div>

        <button
          className={`button ${!canContinue ? 'disabled' : ''}`}
          disabled={!canContinue}
          onClick={handleContinueCrawl}
        >
          Continue Crawling <FaPlay />
        </button>

        <button className={`button ${!isCrawling ? 'disabled' : ''}`} disabled={!isCrawling} onClick={handleStopCrawl}>
          Stop Crawling <FaStop />
        </button>

        <button className={`button ${isCrawling ? 'disabled' : ''}`} disabled={isCrawling} onClick={handleResetCrawl}>
          Reset Crawling <FaSync />
        </button>

        <button
          className={`button ${isCrawling || !crawledCount ? 'disabled' : ''}`}
          disabled={isCrawling || !crawledCount}
          onClick={handleExportCrawledCreators}
        >
          Export Crawled Creators <FaFileExport />
        </button>
      </div>

      <div className="progress-area">
        <label htmlFor="crawler-progress" className="progress-label">
          Crawling Progress:
        </label>

        <progress id="crawler-progress" value={crawlProgress} max="100" className="progress-bar" />

        <span className="progress-percentage">{crawlProgress}%</span>
      </div>

      <span className="crawled-creators-count">
        Crawled Creators: {crawledCount} / {creatorIds.filter(Boolean).length}
      </span>

      {crawlDuration && <span className={crawlDuration}>Crawl Duration: {crawlDuration}</span>}

      {!isEmptyArray(notFoundCreators) && (
        <>
          <hr className="separator" />
          <div className="not-found-creators-area">
            <h4>Not Found Creator IDs</h4>
            <table className="not-found-table">
              <thead>
                <tr>
                  <th className="table-th">Creator ID</th>
                </tr>
              </thead>
              <tbody>
                {notFoundCreators.map((id, index) => (
                  <tr key={index}>
                    <td className="table-td">{id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className={`button ${isCrawling || isEmptyArray(notFoundCreators) ? 'disabled' : ''}`}
              disabled={isCrawling || isEmptyArray(notFoundCreators)}
              onClick={handleExportNotFoundCreators}
            >
              Export Not Found Creators <FaFileExport />
            </button>
          </div>
        </>
      )}
    </main>
  )
}
