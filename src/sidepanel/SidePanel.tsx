import { useEffect, useRef, useState } from 'react'
import { FaFileExport, FaFileUpload, FaPlay, FaStop } from 'react-icons/fa'
import { ActionType, SwalIconType } from '../types/enums'
import { isEmptyArray, isNullOrUndefined } from '../utils/checks'
import { formatSeconds } from '../utils/formatters'
import { ADUSwal } from '../utils/swal'
import './SidePanel.css'

export const SidePanel = () => {
  const [hasMsToken, setHasMsToken] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawledCount, setCrawledCount] = useState(0)
  const [creatorIds, setCreatorIds] = useState<string[]>([])
  const [notFoundCreators, setNotFoundCreators] = useState<string[]>([])
  const [crawlDuration, setCrawlDuration] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => fileInputRef.current?.click()

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (isNullOrUndefined(file)) {
      return ADUSwal({
        title: 'Upload Error',
        text: 'No file was selected for upload.',
        icon: SwalIconType.ERROR,
      })
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string | undefined
      if (typeof fileContent !== 'string') {
        return ADUSwal({
          title: 'File Read Error',
          text: 'Failed to read the content of the uploaded file.',
          icon: SwalIconType.ERROR,
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
          showConfirmButton: false,
        })
    }
    reader.onerror = () => {
      return ADUSwal({
        title: 'File Read Error',
        text: 'An error occurred while trying to read the file.',
        icon: SwalIconType.ERROR,
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
        icon: SwalIconType.ERROR,
      })
    }

    chrome.storage.local.get(['crawledCreators'], ({ crawledCreators }) => {
      if (isEmptyArray(crawledCreators)) return startCrawl(validIds)

      ADUSwal({
        title: 'Are you sure?',
        text: 'Starting a new crawl will clear all previously crawled data. Are you sure you want to proceed?',
        icon: SwalIconType.WARNING,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, clear and start!',
        cancelButtonText: 'No, cancel',
      }).then((result) => result.isConfirmed && startCrawl(validIds))
    })
  }

  const startCrawl = (validIds: string[]) => {
    setIsCrawling(true)
    setCrawlProgress(0)
    setCrawledCount(0)
    setNotFoundCreators([])
    setCrawlDuration(null)

    chrome.storage.local.remove(
      ['processCount', 'crawledCreators', 'creatorIds', 'notFoundCreators', 'crawlDurationSeconds'],
      () => {
        if (chrome.runtime.lastError) {
          return ADUSwal({
            title: 'Storage Error',
            text: 'Failed to clear local storage. Crawling may not start correctly.',
            icon: SwalIconType.ERROR,
          }).then(() => setIsCrawling(false))
        }

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tabId = tabs[0]?.id
          if (typeof tabId !== 'number') {
            return ADUSwal({
              title: 'Tab Error',
              text: 'Active TikTok tab not found. Please navigate to TikTok Affiliate page.',
              icon: SwalIconType.ERROR,
            }).then(() => setIsCrawling(false))
          }

          chrome.storage.local.set({ isStarted: true, creatorIds: validIds, startTime: Date.now() }, async () => {
            if (chrome.runtime.lastError) {
              return ADUSwal({
                title: 'Storage Error',
                text: 'Failed to set initial crawling data in storage.',
                icon: SwalIconType.ERROR,
              }).then(() => setIsCrawling(false))
            }

            await chrome.tabs.sendMessage(tabId, { action: ActionType.START_CRAWLING, creatorIds: validIds })
          })
        })
      },
    )
  }

  const handleStopCrawl = () => {
    setIsCrawling(false)

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (typeof tabId !== 'number') {
        return ADUSwal({
          title: 'Tab Error',
          text: 'Active TikTok tab not found. Please navigate to TikTok Affiliate page.',
          icon: SwalIconType.ERROR,
        }).then(() => setIsCrawling(false))
      }

      chrome.storage.local.set({ isStarted: false }, async () => {
        if (chrome.runtime.lastError) {
          return ADUSwal({
            title: 'Storage Error',
            text: 'Failed to set initial crawling data in storage.',
            icon: SwalIconType.ERROR,
          }).then(() => setIsCrawling(false))
        }

        await chrome.tabs.sendMessage(tabId, { action: ActionType.STOP_CRAWLING })
      })
    })
  }

  const handleExportCrawledCreators = () => {
    chrome.storage.local.get(['crawledCreators'], ({ crawledCreators }) => {
      if (isEmptyArray(crawledCreators)) {
        return ADUSwal({
          title: 'Export Error',
          text: 'No creator data crawled yet. Please start crawling to export data.',
          icon: SwalIconType.ERROR,
        })
      }

      const data = JSON.stringify(crawledCreators, null, 2)
      const now = new Date()
      const date = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
      const filename = `tiktok_creator_data_${date}.json`

      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const aTag = document.createElement('a')
      aTag.href = url
      aTag.download = filename

      document.body.appendChild(aTag)
      aTag.click()
      document.body.removeChild(aTag)
      URL.revokeObjectURL(url)
    })
  }

  const handleExportNotFoundCreators = () => {
    if (isEmptyArray(notFoundCreators)) {
      return ADUSwal({
        title: 'Export Error',
        text: 'No not found creator IDs to export.',
        icon: SwalIconType.ERROR,
      })
    }

    const data = notFoundCreators.join('\n')
    const now = new Date()
    const date = `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
    const filename = `tiktok_not_found_creators_${date}.txt`

    const blob = new Blob([data], { type: 'text/plain' })
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
    const updateStateFromStorage = () => {
      chrome.storage.local.get(
        ['hasMsToken', 'isStarted', 'processCount', 'crawledCreators', 'creatorIds', 'notFoundCreators', 'startTime'],
        ({
          hasMsToken: storedHasMsToken,
          isStarted,
          processCount,
          crawledCreators,
          creatorIds,
          notFoundCreators: storedNotFoundCreators,
          startTime,
        }) => {
          const crawledCreatorsCount = isEmptyArray(crawledCreators) ? 0 : crawledCreators.length
          const totalCreatorIdsCount = isEmptyArray(creatorIds) ? 0 : creatorIds.length
          const calculatedProgress =
            totalCreatorIdsCount > 0 && !isNullOrUndefined(processCount)
              ? Math.round((processCount / totalCreatorIdsCount) * 100)
              : 0

          setHasMsToken(!!storedHasMsToken)
          setIsCrawling(!!isStarted)
          setCrawlProgress(calculatedProgress)
          setCrawledCount(crawledCreatorsCount)
          setCreatorIds(creatorIds || [])
          setNotFoundCreators(storedNotFoundCreators || [])

          if (!isStarted && startTime) {
            const endTime = Date.now()
            const durationSeconds = Math.round((endTime - startTime) / 1000)
            setCrawlDuration(formatSeconds(durationSeconds))
          } else {
            setCrawlDuration(null)
          }
        },
      )
    }

    updateStateFromStorage()

    const storageChangeListener = () => updateStateFromStorage()
    chrome.storage.onChanged.addListener(storageChangeListener)

    const handleLoginRequiredMessage = (message: any) => {
      if (message.action !== ActionType.LOGIN_REQUIRED) return
      setHasMsToken(!!message.hasMsToken)
    }
    chrome.runtime.onMessage.addListener(handleLoginRequiredMessage)

    return () => {
      chrome.storage.onChanged.removeListener(storageChangeListener)
      chrome.runtime.onMessage.removeListener(handleLoginRequiredMessage)
    }
  }, [isCrawling])

  return (
    <main className="side-panel-container">
      {hasMsToken ? (
        <>
          <h3>TikTok Creator Data Crawler</h3>
          <div className="input-area">
            <label htmlFor="creatorIds" className="input-label">
              Creator IDs:
              <button
                className={`upload-icon-button ${isCrawling ? 'disabled' : ''}`}
                disabled={isCrawling}
                title="Upload a text file (.txt) with creator IDs (one ID per line)"
                type="button"
                onClick={handleUploadClick}
              >
                <FaFileUpload className={`${isCrawling ? 'disabled' : ''}`} />
              </button>
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
              className={`button start-button ${isCrawling ? 'disabled' : ''}`}
              disabled={isCrawling}
              onClick={handleStartCrawl}
            >
              Start Crawling <FaPlay />
            </button>

            <button
              className={`button stop-button ${!isCrawling ? 'disabled' : ''}`}
              disabled={!isCrawling}
              onClick={handleStopCrawl}
            >
              Stop Crawling <FaStop />
            </button>

            <button
              className={`button export-button ${isCrawling || !crawledCount ? 'disabled' : ''}`}
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
                  className="button export-not-found-button"
                  disabled={isEmptyArray(notFoundCreators)}
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
