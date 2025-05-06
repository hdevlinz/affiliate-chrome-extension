export interface CreatorProfile {
  [key: string]: any
}

export interface Creator {
  id: string
  uniqueId: string
  nickname: string
  profiles: CreatorProfile
}

export interface CrawlError {
  data: { [key: string]: any }
  code: string
  message: string
}

export interface LocalStorageState {
  useApi: boolean
  isCrawling: boolean
  isAutoCrawling: boolean
  startTime: number
  processCount: number
  crawlDurationSeconds: number
  creatorIds: string[]
  crawledCreators: Creator[]
  notFoundCreators: string[]
  currentCreatorIndex: number
}

export interface SyncStorageState {
  apiKeyValue: string
  creatorIdsEndpoint: string
  postCreatorDataEndpoint: string
  postCreatorErrorEndpoint: string
}

export interface ExtensionMessage {
  action: string
  [key: string]: any
}

export interface NotificationOptions {
  title: string
  message: string
}

export interface InterceptData {
  url: string
  method: string
  query: Record<string, string>
  status: number
  requestHeaders: any
  requestPayload: any
  responsePayload: any
}
