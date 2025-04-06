import { TimeIntervalUnit } from './enums'

export interface CrawlError {
  data: { [key: string]: any }
  code: string
  message: string
}

export interface CreatorProfile {
  [key: string]: any
}

export interface Creator {
  id: string
  uniqueId: string
  nickname: string
  profiles: CreatorProfile
}

export interface NotificationOptions {
  title: string
  message: string
}

export interface StorageState {
  useApi: boolean
  isCrawling: boolean
  startTime: number
  processCount: number
  crawlDurationSeconds: number
  creatorIds: string[]
  crawledCreators: Creator[]
  notFoundCreators: string[]
  currentCreatorIndex: number
  crawlIntervalDuration: number
  crawlIntervalUnit: TimeIntervalUnit
}

export interface ApiConfig {
  creatorIdsEndpoint: string
  postCreatorDataEndpoint: string
  postCreatorErrorEndpoint: string
  apiKeyFormat: string
  apiKeyValue: string
  crawlIntervalDuration: number
  crawlIntervalUnit: TimeIntervalUnit
}

export interface ExtensionMessage {
  action: string
  [key: string]: any
}

export interface InterceptData {
  url: string
  requestHeaders: Record<string, string>
  responsePayload: any
}

export interface AlertOptions {
  [key: string]: any
}
