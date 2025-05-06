export enum LogLevel {
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

export enum AlertIconType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  QUESTION = 'question'
}

export enum ActionType {
  START_CRAWLING = 'start_crawling',
  CONTINUE_CRAWLING = 'continue_crawling',
  STOP_CRAWLING = 'stop_crawling',
  RESET_CRAWLING = 'reset_crawling',
  COMPLETED_CRAWLING = 'crawl_completed',
  TOGGLE_SIDE_PANEL = 'toggle_sidebar',
  FETCH_DATA = 'fetch_data',
  SAVE_DATA = 'save_data',
  SHOW_NOTIFICATION = 'show_notification'
}
