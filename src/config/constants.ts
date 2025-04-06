export const AFFILIATE_TIKTOK_HOST = 'affiliate.tiktok.com'
export const FIND_CREATOR_PATH = '/connection/creator'
export const FIND_CREATOR_URL = `https://${AFFILIATE_TIKTOK_HOST}${FIND_CREATOR_PATH}?shop_region=VN`

export const KEYS_TO_OMIT = ['code', 'message', 'is_authorized', 'status']
export const PROFILE_TYPE = [1, 2, 3, 4, 5]

export const MIN_SIDEPANEL_WIDTH = 200
export const DEFAULT_CRAWL_INTERVAL_SECONDS = 120

export const LOG_PREFIX = process.env.NODE_ENV === 'development' ? '[DEV]' : '[PROD]'
export const LOG_STYLE = 'color: #a394ff; background: #28243d;'

export const THEME = {
  primary: '#a394ff',
  background: '#28243d',
  text: '#ffffff',
  error: '#d33',
  success: '#4CAF50',
  warning: '#FFC107'
}

export const DEFAULT_STORAGE_STATE = {
  useApi: false,
  isCrawling: false,
  startTime: 0,
  processCount: 0,
  crawlDurationSeconds: 0,
  creatorIds: [],
  crawledCreators: [],
  notFoundCreators: [],
  currentCreatorIndex: 0,
  crawlIntervalDuration: 120,
  crawlIntervalUnit: 'seconds'
}
