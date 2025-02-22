export enum ActionType {
  START_CRAWLING = 'start_crawling',
  STOP_CRAWLING = 'stop_crawling',
  FETCH_DATA = 'fetch_data',
  SAVE_DATA = 'save_data',
  CHECK_LOGGED = 'check_logged',
  LOGIN_REQUIRED = 'login_required',
  CHECK_URL = 'check_url',
  INVALID_URL = 'invalid_url',
  SHOW_NOTIFICATION = 'show_notification',
  TOGGLE_SIDEBAR = 'toggle_sidebar',
}

export enum ConsoleType {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export enum SwalIconType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
  QUESTION = 'question',
}
