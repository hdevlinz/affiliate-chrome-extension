import { useEffect, useRef, useState } from 'react'
import { FaCloudDownloadAlt, FaFileExport, FaFileUpload, FaPlay, FaStop, FaSync } from 'react-icons/fa'
import { ActionType, SwalIconType } from '../types/enums'
import { isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { formatSeconds, getFormattedDate } from '../utils/formatters'
import { ADUSwal } from '../utils/swal'
import './SidePanel.css'

export const SidePanel = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawledCount, setCrawledCount] = useState(0)
  const [crawlDuration, setCrawlDuration] = useState<string | null>(null)
  const [creatorIds, setCreatorIds] = useState<string[]>([])
  const [notFoundCreators, setNotFoundCreators] = useState<string[]>([])

  const handleFetchFromAPI = async () => {
    ADUSwal({
      title: 'Fetching Creator IDs',
      text: 'Please wait while we fetch creator IDs from the API...',
      icon: SwalIconType.INFO,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    })

    try {
      const response = await fetch('https://67bbf28ded4861e07b38a491.mockapi.io/api/v1/creator-ids/creators')
      if (!response.ok) {
        return ADUSwal({
          title: 'API Error',
          text: 'Failed to fetch creator IDs from the API.',
          icon: SwalIconType.ERROR
        })
      }

      const creatorJsonResponse = await response.json()
      if (isEmptyArray(creatorJsonResponse)) {
        return ADUSwal({
          title: 'API Error',
          text: 'No creator IDs were fetched from the API.',
          icon: SwalIconType.ERROR
        })
      }

      const creatorIds = creatorJsonResponse.map((creator: any) => creator.id)
      setCreatorIds(creatorIds)
      ADUSwal({
        title: 'API Fetched',
        text: `Successfully fetched ${creatorIds.length} creator IDs from the API.`,
        icon: SwalIconType.SUCCESS,
        timer: 2000,
        showConfirmButton: false
      })
    } catch (error) {
      console.error('Error fetching creator IDs:', error)
      ADUSwal({
        title: 'API Error',
        text: 'An error occurred while trying to fetch creator IDs from the API.',
        icon: SwalIconType.ERROR
      })
    }
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (isNullOrUndefined(file)) {
      return ADUSwal({
        title: 'Upload Error',
        text: 'No file was selected for upload.',
        icon: SwalIconType.ERROR
      })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string | undefined
      if (typeof fileContent !== 'string') {
        return ADUSwal({
          title: 'File Read Error',
          text: 'Failed to read the content of the uploaded file.',
          icon: SwalIconType.ERROR
        })
      }

      const ids = fileContent
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      setCreatorIds(ids)
      ids &&
        ADUSwal({
          title: 'File Uploaded',
          text: `Successfully loaded ${ids.length} creator IDs from the file.`,
          icon: SwalIconType.SUCCESS,
          timer: 2000,
          showConfirmButton: false
        })
    }
    reader.onerror = () => {
      return ADUSwal({
        title: 'File Read Error',
        text: 'An error occurred while trying to read the file.',
        icon: SwalIconType.ERROR
      })
    }
    reader.readAsText(file)
  }

  const handleStartCrawl = () => {
    const validIds = creatorIds.filter(Boolean)
    if (isEmptyArray(validIds)) {
      return ADUSwal({
        title: 'Input Error',
        text: 'Please enter or upload creator IDs before starting.',
        icon: SwalIconType.ERROR
      })
    }

    chrome.storage.local.get(['crawledCreators'], ({ crawledCreators }) => {
      if (isNullOrUndefined(crawledCreators) || isEmptyArray(crawledCreators)) return startCrawl(validIds)

      ADUSwal({
        title: 'Are you sure?',
        text: 'Starting a new crawl will clear all previously crawled data. Are you sure you want to proceed?',
        icon: SwalIconType.WARNING,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, clear and start!',
        cancelButtonText: 'No, cancel'
      }).then((result) => result.isConfirmed && startCrawl(validIds))
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
            startTime: Date.now(),
            creatorIds: validIds
          })
        })
      }
    )
  }

  const handleContinueCrawl = () => {
    setIsCrawling(true)
    setCanContinue(false)

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (isNullOrUndefined(tabs[0].id)) {
        setIsCrawling(false)
        setCanContinue(true)
        return
      }

      await chrome.storage.local.set({ isCrawling: true })
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.CONTINUE_CRAWLING })
    })
  }

  const handleStopCrawl = () => {
    setIsCrawling(false)
    setCanContinue(true)

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (isNullOrUndefined(tabs[0].id)) {
        setIsCrawling(true)
        setCanContinue(false)
        return
      }

      await chrome.storage.local.set({ isCrawling: false })
      await chrome.tabs.sendMessage(tabs[0].id, { action: ActionType.STOP_CRAWLING })
    })
  }

  const handleResetCrawl = async () => {
    ADUSwal({
      title: 'Are you sure?',
      text: 'Resetting the crawl will clear all crawled data and stop the current process. Are you sure you want to proceed?',
      icon: SwalIconType.WARNING,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear and start!',
      cancelButtonText: 'No, cancel'
    }).then((result) => result.isConfirmed && resetCrawl())
  }

  const resetCrawl = () => {
    setIsCrawling(false)
    setCanContinue(false)
    setCrawlProgress(0)
    setCrawledCount(0)
    setCrawlDuration(null)
    setCreatorIds([])
    setNotFoundCreators([])

    chrome.storage.local.remove(
      [
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
          ADUSwal({
            title: 'Crawl Reset',
            text: 'The crawling process has been reset successfully.',
            icon: SwalIconType.SUCCESS
          })
        })
      }
    )
  }

  const handleExportCrawledCreators = () => {
    chrome.storage.local.get(['crawledCreators'], ({ crawledCreators }) => {
      if (isEmptyArray(crawledCreators)) {
        return ADUSwal({
          title: 'Export Error',
          text: 'No creator data crawled yet. Please start crawling to export data.',
          icon: SwalIconType.ERROR
        })
      }

      const data = JSON.stringify(crawledCreators, null, 2)
      const filename = `tiktok_crawled_creators_${getFormattedDate()}.json`
      exportFile(data, filename, 'application/json')
    })
  }

  const handleExportNotFoundCreators = () => {
    if (isEmptyArray(notFoundCreators)) {
      return ADUSwal({
        title: 'Export Error',
        text: 'No not found creator IDs to export.',
        icon: SwalIconType.ERROR
      })
    }

    const data = notFoundCreators.join('\n')
    const filename = `tiktok_not_found_creators_${getFormattedDate()}.txt`
    exportFile(data, filename, 'text/plain')
  }

  const exportFile = (data: BlobPart, filename: string, type: any) => {
    const blob = new Blob([data], { type })
    const url = URL.createObjectURL(blob)
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.download = filename
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    chrome.storage.local.get(
      [
        'hasMsToken',
        'isCrawling',
        'processCount',
        'crawlDurationSeconds',
        'creatorIds',
        'crawledCreators',
        'notFoundCreators',
        'currentCreatorIndex'
      ],
      (store) => {
        const totalCreatorIdsCount = isEmptyArray(store.creatorIds) ? 0 : store.creatorIds.length
        const storedCanContinue =
          !!!store.isCrawling &&
          !isNullOrUndefined(store.currentCreatorIndex) &&
          store.currentCreatorIndex < totalCreatorIdsCount
        const crawledCreatorsCount = isEmptyArray(store.crawledCreators) ? 0 : store.crawledCreators.length
        const calculatedProgress =
          totalCreatorIdsCount > 0 && !isNullOrUndefined(store.processCount)
            ? Math.round((store.processCount / totalCreatorIdsCount) * 100)
            : 0

        setIsLoggedIn(!!store.hasMsToken)
        setIsCrawling(!!store.isCrawling)
        setCanContinue(storedCanContinue)
        setCrawlProgress(calculatedProgress)
        setCrawledCount(crawledCreatorsCount)
        setCrawlDuration(formatSeconds(store.crawlDurationSeconds))
        setCreatorIds(store.creatorIds || [])
        setNotFoundCreators(store.notFoundCreators || [])
      }
    )

    const updateStateFromStorage = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName === 'local') {
        chrome.storage.local.get(
          [
            'hasMsToken',
            'isCrawling',
            'processCount',
            'crawlDurationSeconds',
            'creatorIds',
            'crawledCreators',
            'notFoundCreators',
            'currentCreatorIndex'
          ],
          (store) => {
            const totalCreatorIdsCount = isEmptyArray(store.creatorIds) ? 0 : store.creatorIds.length

            if (changes.hasMsToken) setIsLoggedIn(!!store.hasMsToken)

            if (changes.isCrawling) setIsCrawling(!!store.isCrawling)

            if (changes.currentCreatorIndex) {
              const storedCanContinue =
                !!!store.isCrawling &&
                !isNullOrUndefined(store.currentCreatorIndex) &&
                store.currentCreatorIndex < totalCreatorIdsCount
              setCanContinue(storedCanContinue)
            }

            if (changes.processCount) {
              const calculatedProgress =
                totalCreatorIdsCount > 0 && !isNullOrUndefined(store.processCount)
                  ? Math.round((store.processCount / totalCreatorIdsCount) * 100)
                  : 0
              setCrawlProgress(calculatedProgress)
            }

            if (changes.crawledCreators) {
              setCrawledCount(isEmptyArray(store.crawledCreators) ? 0 : store.crawledCreators.length)
            }

            if (changes.crawlDurationSeconds) setCrawlDuration(formatSeconds(store.crawlDurationSeconds))

            if (changes.creatorIds) setCreatorIds(store.creatorIds || [])

            if (changes.notFoundCreators) setNotFoundCreators(store.notFoundCreators || [])
          }
        )
      }
    }

    chrome.storage.onChanged.addListener(updateStateFromStorage)
    return () => chrome.storage.onChanged.removeListener(updateStateFromStorage)
  }, [])

  return (
    <main className="side-panel-container">
      {isLoggedIn ? (
        <>
          <h3>TikTok Creator Data Crawler</h3>
          <div className="input-area">
            <label htmlFor="creatorIds" className="input-label">
              Creator IDs:
              <div>
                <button
                  className={`icon-button ${isCrawling ? 'disabled' : ''}`}
                  disabled={isCrawling}
                  title="Fetch creator IDs from API"
                  type="button"
                  onClick={handleFetchFromAPI}
                >
                  <FaCloudDownloadAlt className={`${isCrawling ? 'disabled' : ''}`} />
                </button>
                <button
                  className={`icon-button ${isCrawling ? 'disabled' : ''}`}
                  disabled={isCrawling}
                  title="Upload a text file (.txt) with creator IDs (one ID per line)"
                  type="button"
                  onClick={handleUploadClick}
                >
                  <FaFileUpload className={`${isCrawling ? 'disabled' : ''}`} />
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
            <button
              className={`button ${isCrawling || canContinue ? 'disabled' : ''}`}
              disabled={isCrawling || canContinue}
              onClick={handleStartCrawl}
            >
              Start Crawling <FaPlay />
            </button>

            <button
              className={`button ${!canContinue ? 'disabled' : ''}`}
              disabled={!canContinue}
              onClick={handleContinueCrawl}
            >
              Continue Crawling <FaPlay />
            </button>

            <button
              className={`button ${!isCrawling ? 'disabled' : ''}`}
              disabled={!isCrawling}
              onClick={handleStopCrawl}
            >
              Stop Crawling <FaStop />
            </button>

            <button
              className={`button ${isCrawling ? 'disabled' : ''}`}
              disabled={isCrawling}
              onClick={handleResetCrawl}
            >
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
            <label htmlFor="crawlerProgress" className="progress-label">
              Crawling Progress:
            </label>

            <progress id="crawlerProgress" value={crawlProgress} max="100" className="progress-bar" />

            <span className="progress-percentage">{crawlProgress}%</span>
          </div>

          <span className="crawled-creators-count">
            Crawled Creators: {crawledCount} / {creatorIds.filter(Boolean).length}
          </span>

          {crawlDuration && <span className="crawl-duration">Crawl Duration: {crawlDuration}</span>}

          {!isEmptyArray(notFoundCreators) && (
            <>
              <hr style={{ margin: '0.75rem 0' }} />
              <div className="not-found-creators-area">
                <h4>Not Found Creator IDs</h4>
                <table className="not-found-table">
                  <thead>
                    <tr>
                      <th>Creator ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notFoundCreators.map((id, index) => (
                      <tr key={index}>
                        <td>{id}</td>
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
        </>
      ) : (
        <div className="login-required-container">
          <h3>Login Required</h3>
          <p className="login-required-text">
            Please log in to your TikTok Affiliate account on this page to use the crawler.
          </p>
        </div>
      )}
    </main>
  )
}
