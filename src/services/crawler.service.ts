import { merge } from 'lodash'
import { Creator, CreatorProfile, CrawlError, InterceptData } from '../types'
import { KEYS_TO_OMIT, PROFILE_TYPE } from '../config/constants'
import { storageService } from './storage.service'
import { messagingService } from './messaging.service'
import { createLogger } from '../utils/logger'
import { deepFlatten, deepOmit } from '../utils/helpers'
import { CREATOR_HAS_NO_PROFILES, CREATOR_NOT_FOUND } from '../types/exceptions'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/checks'

const logger = createLogger('CrawlerService')

class CrawlerService {
  private state = {
    fetchPromises: [] as Promise<any>[],
    isCrawling: false,
    startTime: 0,
    creatorIds: [] as string[],
    notFoundCreators: [] as string[],
    currentCreatorIndex: 0,
    useApi: false,
    headers: {} as Record<string, string>,
    postCreatorDataEndpoint: null as string | null,
    postCreatorErrorEndpoint: null as string | null
  }

  private crawlTimeoutId: NodeJS.Timeout | null = null

  /**
   * Reset the crawler state to defaults
   */
  public resetState(): void {
    logger.info('Resetting crawler state')
    this.state = {
      fetchPromises: [],
      isCrawling: false,
      startTime: 0,
      creatorIds: [],
      notFoundCreators: [],
      currentCreatorIndex: 0,
      useApi: false,
      headers: {},
      postCreatorDataEndpoint: null,
      postCreatorErrorEndpoint: null
    }
  }

  /**
   * Update crawler state with new values
   */
  public updateState(updates: Partial<typeof this.state>): void {
    Object.assign(this.state, updates)
  }

  /**
   * Get the current crawler state
   */
  public getState(): typeof this.state {
    return { ...this.state }
  }

  /**
   * Post creators data to the configured endpoint
   */
  public async postCreatorsData(data: Creator | Creator[]): Promise<void> {
    if (!this.state.postCreatorDataEndpoint) {
      logger.warn('Cannot post creator data: No endpoint configured')
      return
    }

    const validatedCreatorsData = Array.isArray(data) ? data : [data]

    try {
      logger.info(`Posting ${validatedCreatorsData.length} creator(s) data to API`)
      await fetch(this.state.postCreatorDataEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          ...this.state.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedCreatorsData)
      })
    } catch (error) {
      logger.error('Error posting creators data:', error)
    }
  }

  /**
   * Post creators error information to the configured endpoint
   */
  public async postCreatorsError(data: CrawlError | CrawlError[]): Promise<void> {
    if (!this.state.postCreatorErrorEndpoint) {
      logger.warn('Cannot post creator error: No endpoint configured')
      return
    }

    const validatedCreatorsError = Array.isArray(data) ? data : [data]

    try {
      logger.info(`Posting ${validatedCreatorsError.length} creator error(s) to API`)
      await fetch(this.state.postCreatorErrorEndpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          ...this.state.headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(validatedCreatorsError)
      })
    } catch (error) {
      logger.error('Error posting creators error:', error)
    }
  }

  /**
   * Process the search input for the current creator
   */
  public processSearchInput(searchInput: HTMLInputElement): void {
    if (!this.state.isCrawling || this.state.currentCreatorIndex >= this.state.creatorIds.length) {
      logger.warn('Cannot process search input: Crawling is not active or reached the end')
      return
    }

    // Update process count
    storageService.getLocalStorage().then(({ processCount = 0 }) => {
      storageService.updateLocalStorage({ processCount: processCount + 1 })
    })

    // Search current creator
    const currentCreatorId = this.state.creatorIds[this.state.currentCreatorIndex]
    searchInput.value = currentCreatorId
    searchInput.dispatchEvent(new Event('input', { bubbles: true }))
    searchInput.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true
      })
    )

    // Schedule next creator
    this.crawlTimeoutId = setTimeout(() => {
      this.crawlTimeoutId = null
      this.state.currentCreatorIndex++
      storageService.updateLocalStorage({ currentCreatorIndex: this.state.currentCreatorIndex })
      this.continueCrawling()
    }, 4000)

    logger.info(
      `Search creator: ${currentCreatorId} (Index: ${this.state.currentCreatorIndex + 1} / ${this.state.creatorIds.length})`
    )
  }

  /**
   * Continue the crawling process
   */
  public continueCrawling(): void {
    // Check if crawling should stop
    if (!this.state.isCrawling || this.state.currentCreatorIndex >= this.state.creatorIds.length) {
      this.finishCrawling()
      return
    }

    // Find search input
    const searchInput = document.querySelector('input[data-tid="m4b_input_search"]') as HTMLInputElement | null
    if (!searchInput) {
      if (this.crawlTimeoutId) {
        clearTimeout(this.crawlTimeoutId)
        this.crawlTimeoutId = null
      }

      this.state.isCrawling = false
      logger.warn('Search input field not found! Crawling cannot continue.')
      storageService.updateLocalStorage({ isCrawling: false })
      messagingService.showNotification({
        title: 'Crawler Error',
        message: 'Search input field not found! Crawling cannot continue.'
      })
      return
    }

    this.processSearchInput(searchInput)
  }

  /**
   * Finish the crawling process and clean up
   */
  private async finishCrawling(): Promise<void> {
    if (this.crawlTimeoutId) {
      clearTimeout(this.crawlTimeoutId)
      this.crawlTimeoutId = null
    }

    await Promise.allSettled(this.state.fetchPromises)

    if (!this.state.isCrawling && this.state.currentCreatorIndex < this.state.creatorIds.length) {
      messagingService.showNotification({
        title: 'Creator Crawler Stopped',
        message: 'The creator crawling process has been stopped.'
      })
      return
    }

    const { crawledCreators = [] } = await storageService.getLocalStorage()
    const crawledCreatorIds = crawledCreators.map((creator: Creator) => creator.id)

    await storageService.updateLocalStorage({
      isCrawling: false,
      crawlDurationSeconds: Math.round((Date.now() - this.state.startTime) / 1000),
      notFoundCreators: this.state.notFoundCreators.filter((creatorId) => !crawledCreatorIds.includes(creatorId))
    })

    messagingService.showNotification({
      title: 'Creator Crawler Completed',
      message: 'The creator crawling process has been completed for all creators.'
    })
    this.resetState()
  }

  /**
   * Initialize the crawler with settings and start crawling
   */
  public async initializeAndStart(
    useApi: boolean,
    creatorIds: string[],
    startTime: number = Date.now()
  ): Promise<void> {
    logger.info('Initializing crawler with settings')

    // Get API settings from sync storage
    const syncSettings = await storageService.getSyncStorage()

    this.resetState()

    this.updateState({
      postCreatorDataEndpoint: syncSettings.postCreatorDataEndpoint || null,
      postCreatorErrorEndpoint: syncSettings.postCreatorErrorEndpoint || null,
      useApi,
      isCrawling: true,
      startTime,
      creatorIds
    })

    // Set up API headers if provided
    if (syncSettings.apiKeyFormat && syncSettings.apiKeyValue) {
      this.state.headers = {
        [syncSettings.apiKeyFormat]: syncSettings.apiKeyValue
      }
    }

    // Validate API settings if needed
    if (useApi && isEmpty(this.state.postCreatorDataEndpoint) && isEmpty(this.state.postCreatorErrorEndpoint)) {
      await storageService.updateLocalStorage({ isCrawling: false })
      messagingService.showNotification({
        title: 'Creator Crawler Stopped',
        message: 'API endpoint is not set! Crawling cannot start.'
      })
      this.resetState()
      return
    }

    this.continueCrawling()
  }

  /**
   * Process intercepted creator data from network requests
   */
  public async processInterceptedData(interceptData: InterceptData): Promise<void> {
    if (this.state.currentCreatorIndex >= this.state.creatorIds.length) {
      logger.debug('Ignoring intercepted data: Reached end of creator list')
      return
    }

    const currentCreatorId = this.state.creatorIds[this.state.currentCreatorIndex]
    logger.info('Processing intercepted data for creator:', currentCreatorId)

    const creatorProfiles = interceptData.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === currentCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      logger.warn(`Creator potentially not found in affiliate system: ${currentCreatorId}`)

      if (!this.state.notFoundCreators.includes(currentCreatorId)) {
        this.state.notFoundCreators.push(currentCreatorId)
        logger.info(`Added ${currentCreatorId} to notFoundCreators list.`)

        if (this.state.useApi) {
          await this.postCreatorsError({
            data: { creator_id: currentCreatorId },
            code: CREATOR_NOT_FOUND,
            message: 'Creator potentially not found in affiliate system'
          })
        }
      }

      return
    }

    await this.fetchCreatorProfiles(matchingCreator, interceptData)
  }

  /**
   * Fetch detailed profiles for a creator
   */
  private async fetchCreatorProfiles(matchingCreator: any, interceptData: InterceptData): Promise<void> {
    const currentCreatorId = this.state.creatorIds[this.state.currentCreatorIndex]
    const headers = {
      ...interceptData.requestHeaders,
      'Content-Type': 'application/json'
    }

    const fetchProfilePromises: Promise<any>[] = PROFILE_TYPE.sort(() => Math.random() - 0.5).map(
      async (profile_type) => {
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          const response = await fetch(interceptData.url.replace('/find', '/profile'), {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
              creator_oec_id: matchingCreator.creator_oecuid.value,
              profile_types: [profile_type]
            })
          })

          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

          const crawlerResponse = await response.json()
          const { code, message, ...profileData } = crawlerResponse

          if (code !== 0 || message !== 'success') throw new Error(`API error! code: ${code}, message: ${message}`)

          const normalizedProfileData = deepFlatten(deepOmit(profileData, KEYS_TO_OMIT))
          return { data: normalizedProfileData }
        } catch (error) {
          logger.error(`Error fetching profiles of creator: ${currentCreatorId}`, error)
          return null
        }
      }
    )

    this.state.fetchPromises.push(...fetchProfilePromises)

    const creatorProfileResponses = await Promise.all(fetchProfilePromises)
    const filteredProfileResults = creatorProfileResponses.filter(Boolean)

    if (isEmptyArray(filteredProfileResults)) {
      logger.warn(`Profiles not found for creator: ${currentCreatorId}`)

      if (this.state.useApi) {
        await this.postCreatorsError({
          data: { creator_id: currentCreatorId },
          code: CREATOR_HAS_NO_PROFILES,
          message: `Creator '${currentCreatorId}' has no profiles.`
        })
      }
      return
    }

    const creatorData: Creator = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item?.data)) as CreatorProfile
    }

    logger.info(`Processed profiles for creator: ${currentCreatorId}`, creatorData)

    if (this.state.useApi) {
      await this.postCreatorsData(creatorData)
    }

    await messagingService.saveCreatorData(creatorData)
  }

  /**
   * Stop the active crawling process
   */
  public stopCrawling(): void {
    if (this.crawlTimeoutId) {
      clearTimeout(this.crawlTimeoutId)
      this.crawlTimeoutId = null
      logger.info('Cleared pending crawl timeout due to STOP.')
    }

    this.state.isCrawling = false
    storageService.updateLocalStorage({ isCrawling: false })
  }
}

// Export a singleton instance
export const crawlerService = new CrawlerService()
