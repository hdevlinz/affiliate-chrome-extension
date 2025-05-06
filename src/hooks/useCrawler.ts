import { useEffect, useRef, useState } from 'react'
import { messagingService } from '../services/messaging.service'
import { storageService } from '../services/storage.service'
import { ActionType } from '../types/enums'
import { alert } from '../utils/alert'
import { formatSeconds, getFormattedDate } from '../utils/formatters'
import { exportFile } from '../utils/helpers'
import { createLogger } from '../utils/logger'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/validators'

const logger = createLogger('useCrawler')

export function useCrawler() {
  const [useApi, setUseApi] = useState(false)
  const [isCrawling, setIsCrawling] = useState(false)
  const [canContinue, setCanContinue] = useState(false)
  const [isAutoCrawling, setIsAutoCrawling] = useState(false)
  const [creatorIds, setCreatorIds] = useState<string[]>([])
  const [notFoundCreators, setNotFoundCreators] = useState<string[]>([])
  const [processCount, setProcessCount] = useState(0)
  const [crawledCount, setCrawledCount] = useState(0)
  const [crawlProgress, setCrawlProgress] = useState(0)
  const [crawlDuration, setCrawlDuration] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (isNullOrUndefined(file)) {
      alert.error('File Error', 'No file selected.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const fileContent = e.target?.result as string | undefined
      if (typeof fileContent !== 'string') {
        alert.error('File Error', 'Failed to read file content.')
        return
      }

      const ids = fileContent
        .trim()
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
      setCreatorIds(ids)

      if (!useApi) {
        storageService.updateLocalStorage({ creatorIds: ids })
      }

      alert.success('File Loaded', `Successfully loaded ${ids.length} creator IDs from the file.`)
    }
    reader.onerror = () => alert.error('File Error', 'An error occurred while reading the file.')
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

    // Clear previous crawl data
    await storageService.updateLocalStorage({
      currentCreatorIndex: 0,
      processCount: 0,
      crawlDurationSeconds: 0,
      crawledCreators: [],
      notFoundCreators: []
    })

    try {
      await messagingService.startCrawling(useApi, validIds)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error starting crawl:', error)

      setIsCrawling(false)
      await storageService.updateLocalStorage({ isCrawling: false })

      alert.error(
        'Communication Error',
        `Failed to communicate with the content script. Ensure you are on a TikTok page and try refreshing the extension/page. Error: ${errorMessage}`
      )
    }
  }

  const handleStartCrawl = async () => {
    const validIds = creatorIds.map((id) => id.trim()).filter(Boolean)
    if (isEmptyArray(validIds)) {
      alert.error('Crawl Error', 'Please enter or upload creator IDs before starting.')
      return
    }

    const { crawledCreators } = await storageService.getLocalStorage()
    if (isNullOrUndefined(crawledCreators) || isEmptyArray(crawledCreators)) {
      startCrawl(validIds)
      return
    }

    // Confirm overwrite if previous data exists
    alert
      .warning(
        'Warning',
        'Starting a new crawl will clear all previously crawled data. Are you sure you want to proceed?'
      )
      .then((result) => {
        if (result.isConfirmed) {
          startCrawl(validIds)
        }
      })
  }

  const handleContinueCrawl = async () => {
    try {
      setIsCrawling(true)
      setCanContinue(false)
      await storageService.updateLocalStorage({ isCrawling: true })
      await messagingService.continueCrawling()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error continuing crawl:', error)

      setIsCrawling(false)
      setCanContinue(true)
      await storageService.updateLocalStorage({ isCrawling: false })

      alert.error('Communication Error', `Failed to communicate with the content script. Error: ${errorMessage}`)
    }
  }

  const handleStopCrawl = async () => {
    try {
      setIsCrawling(false)

      const { currentCreatorIndex, creatorIds: storedIds } = await storageService.getLocalStorage()
      const totalCount = storedIds?.length ?? 0
      const canStillContinue = !isNullOrUndefined(currentCreatorIndex) && currentCreatorIndex < totalCount
      setCanContinue(canStillContinue)

      await storageService.updateLocalStorage({ isCrawling: false })
      await messagingService.stopCrawling()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logger.error('Error stopping crawl:', error)

      alert.error(
        'Communication Error',
        `Failed to send stop signal to the content script, but crawl stopped locally. Error: ${errorMessage}`
      )
    }
  }

  const handleResetCrawl = async () => {
    alert
      .warning(
        'Warning',
        'Resetting the crawl will clear all crawled data and stop the current process. Are you sure you want to proceed?'
      )
      .then(async (result) => {
        if (!result.isConfirmed) {
          return
        }

        if (isAutoCrawling) {
          setIsAutoCrawling(false)
        }

        // Reset local state
        setUseApi(false)
        setIsCrawling(false)
        setCanContinue(false)
        setCrawlProgress(0)
        setCrawledCount(0)
        setCrawlDuration(null)
        setCreatorIds([])
        setNotFoundCreators([])

        // Clear storage
        await storageService.updateLocalStorage({
          useApi: false,
          isCrawling: false,
          processCount: 0,
          currentCreatorIndex: 0,
          crawlDurationSeconds: 0,
          creatorIds: [],
          crawledCreators: [],
          notFoundCreators: [],
          isAutoCrawling: false
        })

        try {
          await messagingService.resetCrawling()
          await alert.success('Crawl Reset', 'The crawl has been reset successfully.')
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error)
          logger.error('Error resetting crawl:', error)

          alert.error(
            'Communication Error',
            `Failed to send reset signal to the content script, but crawl data reset locally. Error: ${errorMessage}`
          )
        }
      })
  }

  const handleExportCrawledCreators = async () => {
    const { crawledCreators } = await storageService.getLocalStorage()
    if (isEmptyArray(crawledCreators)) {
      alert.error('Export Error', 'No data to export.')
      return
    }

    const data = JSON.stringify(crawledCreators, null, 2)
    const filename = `tiktok_crawled_creators_${getFormattedDate()}.json`
    exportFile(data, filename, 'application/json')
  }

  const handleExportNotFoundCreators = async () => {
    if (isEmptyArray(notFoundCreators)) {
      alert.error('Export Error', 'No data to export.')
      return
    }

    const data = notFoundCreators.join('\n')
    const filename = `tiktok_not_found_creators_${getFormattedDate()}.txt`
    exportFile(data, filename, 'text/plain')
  }

  const handleFetchAPI = async (): Promise<string[] | undefined> => {
    const syncResult = await storageService.getSyncStorage()
    if (isEmpty(syncResult.creatorIdsEndpoint)) {
      alert.error('API Error', 'Get Creator IDs URL is not set in settings.').then(() => setUseApi(false))
      return undefined
    }

    alert.info('Fetching Creator IDs', 'Please wait...', {
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    })

    try {
      if (!syncResult.creatorIdsEndpoint) {
        throw new Error('Creator IDs endpoint URL is not properly configured')
      }

      const [url, endpoint] = syncResult.creatorIdsEndpoint.split(':endpoint/')
      logger.info(`Fetching creator IDs from: ${url} with endpoint ${endpoint}`)

      let headers: HeadersInit = {}
      if (syncResult.apiKeyValue) {
        headers = {
          ...headers,
          'X-API-Key': syncResult.apiKeyValue
        }
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint })
      })

      if (!response.ok) {
        setUseApi(false)
        alert.error('API Error', `Failed to fetch creator IDs. Status: ${response.status}. Check console for details.`)
        return undefined
      }

      const jsonData = await response.json()
      if (isNullOrUndefined(jsonData.data) || !isEmptyArray(jsonData.data.items)) {
        setUseApi(false)
        return undefined
      }

      const extractedCreatorIds = jsonData.data.items
        .map((creator: any) => creator?.id)
        .filter((id: any): id is string => typeof id === 'string' && id.trim() !== '')

      if (isEmptyArray(extractedCreatorIds)) {
        setUseApi(false)
        alert.error('API Error', 'No valid creator IDs were found in the API response.')
        return undefined
      }

      await storageService.updateLocalStorage({ creatorIds: extractedCreatorIds })
      setCreatorIds(extractedCreatorIds)

      alert.success('Creator IDs Fetched', `Successfully fetched ${extractedCreatorIds.length} creator IDs.`)

      return extractedCreatorIds
    } catch (error: any) {
      setUseApi(false)
      alert.error('API Error', `An error occurred while trying to fetch creator IDs: ${error.message}`)
      return undefined
    }
  }

  const performAutoCrawlCycle = async () => {
    if (isCrawling) {
      logger.info('Auto-crawl cycle skipped: A crawl is already in progress.')
      return
    }

    logger.info('Performing auto-crawl cycle')

    const fetchedIds = await handleFetchAPI()
    if (isNullOrUndefined(fetchedIds) || isEmptyArray(fetchedIds)) {
      setIsAutoCrawling(false)
      logger.warn('Auto-crawl cycle: Failed to fetch or no IDs returned from API.')
      return
    }

    const validIds = fetchedIds.map((id: string) => id.trim()).filter(Boolean)
    if (isEmptyArray(validIds)) {
      setIsAutoCrawling(false)
      logger.warn('Auto-crawl cycle: No valid IDs after filtering.')
      return
    }

    logger.info('Auto-crawl cycle: Starting crawl with fetched IDs.')
    await startCrawl(validIds)
  }

  const handleToggleAutoCrawl = () => {
    setIsAutoCrawling((prev) => {
      const newState = !prev
      storageService.updateLocalStorage({ isAutoCrawling: newState })

      if (newState) {
        alert.info(
          'Auto Crawl Started',
          'The crawler will automatically start a new crawl when the current one completes.'
        )

        // If we're not currently crawling, start the first cycle
        if (!isCrawling) {
          performAutoCrawlCycle()
        }
      } else {
        alert.info('Auto Crawl Stopped', 'The auto crawl has been disabled.')
      }

      return newState
    })
  }

  // Handle message from content script when crawling is completed
  useEffect(() => {
    const handleCrawlComplete = () => {
      logger.info('Received crawl complete message from content script')

      // Check if auto crawling is enabled and start a new crawl if it is
      storageService.getLocalStorage().then((state) => {
        if (state.isAutoCrawling) {
          logger.info('Auto crawl is enabled, starting new crawl cycle')
          setTimeout(performAutoCrawlCycle, 2000)
        }
      })
    }

    // Listen for messages from content script
    const messageListener = (message: any) => {
      if (message.action === ActionType.COMPLETED_CRAWLING) {
        handleCrawlComplete()
      }
    }

    chrome.runtime.onMessage.addListener(messageListener)

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
    }
  }, [])

  useEffect(() => {
    const initializeState = async () => {
      const localResult = await storageService.getLocalStorage()

      const storedCreatorIds = localResult.creatorIds || []
      const totalCreatorIdsCount = storedCreatorIds.length
      const currentIdx = localResult.currentCreatorIndex ?? 0
      const processCnt = localResult.processCount ?? 0
      const crawledCreatorsCount = localResult.crawledCreators?.length ?? 0

      const initialIsCrawling = !!localResult.isCrawling
      const initialCanContinue = totalCreatorIdsCount > 0 && currentIdx > 0 && currentIdx < totalCreatorIdsCount
      const initialProgress = totalCreatorIdsCount > 0 ? Math.round((processCnt / totalCreatorIdsCount) * 100) : 0
      const initialNotFound = localResult.notFoundCreators || []
      const initialIsAutoCrawling = !!localResult.isAutoCrawling

      setUseApi(!!localResult.useApi)
      setIsCrawling(initialIsCrawling)
      setCanContinue(initialCanContinue)
      setCrawlProgress(initialProgress)
      setProcessCount(processCnt)
      setCrawledCount(crawledCreatorsCount)
      setCrawlDuration(formatSeconds(localResult.crawlDurationSeconds))
      setCreatorIds(storedCreatorIds)
      setNotFoundCreators(initialNotFound)
      setIsAutoCrawling(initialIsAutoCrawling)
    }

    initializeState()

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: chrome.storage.AreaName
    ) => {
      if (areaName === 'local') {
        if (changes.useApi) {
          setUseApi(!!changes.useApi.newValue)
        }

        if (changes.isCrawling) {
          setIsCrawling(!!changes.isCrawling.newValue)
        }

        if (changes.creatorIds) {
          setCreatorIds(changes.creatorIds.newValue || [])
        }

        if (changes.crawledCreators) {
          setCrawledCount((changes.crawledCreators.newValue || []).length)
        }

        if (changes.notFoundCreators) {
          setNotFoundCreators(changes.notFoundCreators.newValue || [])
        }

        if (changes.crawlDurationSeconds) {
          setCrawlDuration(formatSeconds(changes.crawlDurationSeconds.newValue))
        }

        if (changes.isAutoCrawling) {
          setIsAutoCrawling(!!changes.isAutoCrawling.newValue)
        }

        // Recalculate derived values
        storageService.getLocalStorage().then((localResult) => {
          const currentIds = localResult.creatorIds || []
          const currentIdx = localResult.currentCreatorIndex ?? 0
          const processCnt = localResult.processCount ?? 0
          const totalCount = currentIds.length

          setProcessCount(processCnt)

          const updatedCanContinue = totalCount > 0 && currentIdx > 0 && currentIdx < totalCount
          setCanContinue(updatedCanContinue)

          const calculatedProgress = totalCount > 0 ? Math.round((processCnt / totalCount) * 100) : 0
          setCrawlProgress(calculatedProgress)
        })
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    storageService.updateLocalStorage({ useApi })
    if (useApi && !isCrawling && !isAutoCrawling) {
      const fetchIfNeeded = async () => {
        const { creatorIds: existingIds } = await storageService.getLocalStorage()
        if (isEmptyArray(existingIds)) {
          logger.info('useApi enabled with no existing IDs, fetching IDs')
          handleFetchAPI()
        } else {
          logger.info('useApi enabled with existing IDs, skipping fetch')
        }
      }
      fetchIfNeeded()
    }
  }, [useApi])

  useEffect(() => {
    const updateContinueState = async () => {
      const localResult = await storageService.getLocalStorage()
      const currentIds = localResult.creatorIds || []
      const totalCount = currentIds.length
      const currentIdx = localResult.currentCreatorIndex

      const updatedCanContinue =
        totalCount > 0 && !isNullOrUndefined(currentIdx) && currentIdx > 0 && currentIdx < totalCount

      setCanContinue(updatedCanContinue)
    }

    updateContinueState()
  }, [isCrawling, processCount, creatorIds.length])

  useEffect(() => {
    storageService.updateLocalStorage({ isAutoCrawling })

    // Start initial cycle if needed
    if (isAutoCrawling && !isCrawling) {
      if (!useApi) {
        // Auto-enable API mode if not already enabled
        setUseApi(true)
      } else {
        performAutoCrawlCycle()
      }
    }
  }, [isAutoCrawling, useApi, isCrawling])

  const isDisabled = isCrawling || isAutoCrawling
  const totalIds = creatorIds.filter(Boolean).length
  const hasCrawledData = crawledCount > 0
  const hasNotFoundData = !isEmptyArray(notFoundCreators)

  return {
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
  }
}
