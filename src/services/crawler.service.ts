import { merge } from 'lodash'
import { KEYS_TO_OMIT, PROFILE_TYPE } from '../config/constants'
import { CrawlError, Creator, CreatorProfile, InterceptData } from '../types'
import { CREATOR_NOT_FOUND } from '../types/exceptions'
import { deepFlatten, deepOmit } from '../utils/helpers'
import { createLogger } from '../utils/logger'
import { isEmpty, isEmptyArray, isNullOrUndefined } from '../utils/validators'
import { messagingService } from './messaging.service'
import { storageService } from './storage.service'

const logger = createLogger('CrawlerService')

class CrawlerService {
  private state = {
    searchInputSelector: 'input[data-tid="m4b_input_search"]',
    fetchPromises: [] as Promise<any>[],
    creatorSearchDelay: 10000,
    profileFetchDelay: 5000,
    isCrawling: false,
    startTime: 0,
    currentCreatorIndex: 0,
    creatorIds: [] as string[],
    notFoundCreators: [] as string[],
    useApi: false,
    crawlerHeaders: {} as Record<string, string>,
    postCreatorDataEndpoint: null as string | null,
    postCreatorErrorEndpoint: null as string | null
  }

  private crawlTimeoutId: NodeJS.Timeout | null = null

  public getState(): typeof this.state {
    return { ...this.state }
  }

  public updateState(updates: Partial<typeof this.state>): void {
    Object.assign(this.state, updates)
  }

  public resetState(): void {
    this.state = {
      searchInputSelector: 'input[data-tid="m4b_input_search"]',
      fetchPromises: [],
      creatorSearchDelay: 10000,
      profileFetchDelay: 5000,
      isCrawling: false,
      startTime: 0,
      creatorIds: [],
      notFoundCreators: [],
      currentCreatorIndex: 0,
      useApi: false,
      crawlerHeaders: {},
      postCreatorDataEndpoint: null,
      postCreatorErrorEndpoint: null
    }
  }

  public async postCreatorsData(data: Creator | Creator[]): Promise<void> {
    if (!this.state.postCreatorDataEndpoint) {
      logger.warn('Cannot post creator data: No endpoint configured')
      return
    }

    const validatedCreatorsData = Array.isArray(data) ? data : [data]

    const [url, endpoint] = this.state.postCreatorDataEndpoint.split(':endpoint/')

    try {
      logger.info(`Posting ${validatedCreatorsData.length} creator(s) data to API`)
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          ...this.state.crawlerHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          payload: validatedCreatorsData
        })
      })
    } catch (error) {
      logger.error('Error posting creators data:', error)
    }
  }

  public async postCreatorsError(data: CrawlError | CrawlError[]): Promise<void> {
    if (!this.state.postCreatorErrorEndpoint) {
      logger.warn('Cannot post creator error: No endpoint configured')
      return
    }

    const validatedCreatorsError = Array.isArray(data) ? data : [data]

    const [url, endpoint] = this.state.postCreatorErrorEndpoint.split(':endpoint/')

    try {
      logger.info(`Posting ${validatedCreatorsError.length} creator error(s) to API`)
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          ...this.state.crawlerHeaders,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          endpoint,
          payload: validatedCreatorsError
        })
      })
    } catch (error) {
      logger.error('Error posting creators error:', error)
    }
  }

  public async startCrawling(useApi: boolean, creatorIds: string[], startTime: number = Date.now()): Promise<void> {
    // Get API settings from sync storage
    const syncSettings = await storageService.getSyncStorage()

    this.resetState()

    this.updateState({
      isCrawling: true,
      startTime,
      creatorIds,
      useApi,
      postCreatorDataEndpoint: syncSettings.postCreatorDataEndpoint || null,
      postCreatorErrorEndpoint: syncSettings.postCreatorErrorEndpoint || null
    })

    // Validate API settings if needed
    if (useApi && isEmpty(this.state.postCreatorDataEndpoint) && isEmpty(this.state.postCreatorErrorEndpoint)) {
      this.resetState()
      await storageService.updateLocalStorage({ isCrawling: false })
      messagingService.showNotification({
        title: 'Creator Crawler Stopped',
        message: 'API endpoint is not set! Crawling cannot start.'
      })
      return
    }

    // Set up API headers if provided
    if (syncSettings.apiKeyValue) {
      this.state.crawlerHeaders = {
        ...this.state.crawlerHeaders,
        'X-API-Key': syncSettings.apiKeyValue
      }
    }

    this.continueCrawling()
  }

  public continueCrawling(): void {
    // Check if crawling should stop
    if (!this.state.isCrawling || this.state.currentCreatorIndex >= this.state.creatorIds.length) {
      this.finishCrawling()
      return
    }

    // Find search input
    const searchInput = document.querySelector(this.state.searchInputSelector) as HTMLInputElement | null
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

  public stopCrawling(): void {
    if (this.crawlTimeoutId) {
      clearTimeout(this.crawlTimeoutId)
      this.crawlTimeoutId = null
      logger.info('Cleared pending crawl timeout due to STOP.')
    }

    this.state.isCrawling = false
    storageService.updateLocalStorage({ isCrawling: false })
  }

  private async finishCrawling(): Promise<void> {
    if (this.crawlTimeoutId) {
      clearTimeout(this.crawlTimeoutId)
      this.crawlTimeoutId = null
    }

    await Promise.allSettled(this.state.fetchPromises)

    // Check if crawling was stopped manually (not by reaching the end of creator list)
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

    this.resetState()

    // Send notification about completed crawl
    messagingService.showNotification({
      title: 'Creator Crawler Completed',
      message: 'The creator crawling process has been completed for all creators.'
    })

    // Send message to trigger auto-crawl if enabled
    messagingService.completeCrawling()
  }

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
    }, this.state.creatorSearchDelay)

    logger.info(
      `Search creator: ${currentCreatorId} (Index: ${this.state.currentCreatorIndex + 1} / ${this.state.creatorIds.length})`
    )
  }

  public async processNotFoundCreator(creatorId: string): Promise<void> {
    logger.warn(`Creator potentially not found in affiliate system: ${creatorId}`)
    if (this.state.notFoundCreators.includes(creatorId)) {
      logger.info(`Creator ${creatorId} already marked as not found`)
      return
    }

    this.state.notFoundCreators.push(creatorId)
    logger.info(`Added ${creatorId} to notFoundCreators list.`)

    if (this.state.useApi) {
      await this.postCreatorsError({
        data: { creator_id: creatorId },
        code: CREATOR_NOT_FOUND,
        message: 'Creator potentially not found in affiliate system'
      })
    }
  }

  public async processInterceptedData(interceptData: InterceptData): Promise<void> {
    if (this.state.currentCreatorIndex >= this.state.creatorIds.length) {
      logger.debug('Ignoring intercepted data: Reached end of creator list')
      return
    }

    const currentCreatorId = this.state.creatorIds[this.state.currentCreatorIndex]

    logger.info('Checking if creator exists in affiliate system:', currentCreatorId)
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${currentCreatorId}`)

      logger.info('Response from oembed: ', response)

      if (!response.ok) {
        await this.processNotFoundCreator(currentCreatorId)
        return
      }
    } catch (error) {
      await this.processNotFoundCreator(currentCreatorId)
      return
    }

    logger.info('Processing intercepted data for creator:', currentCreatorId)

    const creatorProfiles = interceptData.responsePayload.creator_profile_list
    const matchingCreator = creatorProfiles?.find((creator: any) => creator.handle.value === currentCreatorId)

    if (isEmptyArray(creatorProfiles) || isNullOrUndefined(matchingCreator)) {
      await this.processNotFoundCreator(currentCreatorId)
      return
    }

    await this.fetchCreatorProfiles(matchingCreator, interceptData)
  }

  private async fetchCreatorProfiles(matchingCreator: any, interceptData: InterceptData): Promise<void> {
    const currentCreatorId = this.state.creatorIds[this.state.currentCreatorIndex]

    const fetchProfilePromises: Promise<any>[] = PROFILE_TYPE.sort(() => Math.random() - 0.5).map(
      async (profile_type) => {
        await new Promise((resolve) => setTimeout(resolve, this.state.profileFetchDelay))

        try {
          const response = await fetch(interceptData.url.replace('/find', '/profile'), {
            method: 'POST',
            headers: {
              ...interceptData.requestHeaders,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              creator_oec_id: matchingCreator.creator_oecuid.value,
              profile_types: [profile_type]
            })
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const crawlerResponse = await response.json()
          const { code, message, ...profileData } = crawlerResponse

          if (code !== 0 || message !== 'success') {
            throw new Error(`API error! code: ${code}, message: ${message}`)
          }

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
      return logger.warn(`Profiles not found for creator: ${currentCreatorId}`)
    }

    const creatorData: Creator = {
      id: matchingCreator.creator_oecuid.value,
      uniqueId: matchingCreator.handle.value,
      nickname: matchingCreator.nickname.value,
      profiles: merge({}, ...filteredProfileResults.map((item) => item?.data)) as CreatorProfile
    }

    if (this.state.useApi) {
      await this.postCreatorsData(creatorData)
    }
    await messagingService.saveCreatorData(creatorData)
  }
}

export const crawlerService = new CrawlerService()
