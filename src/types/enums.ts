export enum ActionType {
  TOGGLE_SIDE_PANEL = 'toggle_sidebar',
  OPEN_SIDE_PANEL = 'open_sidebar',
  START_CRAWLING = 'start_crawling',
  CONTINUE_CRAWLING = 'continue_crawling',
  STOP_CRAWLING = 'stop_crawling',
  RESET_CRAWLING = 'reset_crawling',
  FETCH_DATA = 'fetch_data',
  SAVE_DATA = 'save_data',
  SHOW_NOTIFICATION = 'show_notification'
}

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

export enum TimeIntervalUnit {
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours'
}
