import { LOG_PREFIX, LOG_STYLE } from '../config/constants'
import { LogLevel } from '../types/enums'

export const isDev = process.env.NODE_ENV === 'development'

class Logger {
  private enabled: boolean
  private prefix: string
  private style: string

  /**
   * Create a new logger instance
   * @param options - Configuration options for the logger
   */
  constructor(
    options: {
      enabled?: boolean
      prefix?: string
      style?: string
    } = {}
  ) {
    this.enabled = options.enabled ?? isDev
    this.prefix = options.prefix ?? LOG_PREFIX
    this.style = options.style ?? LOG_STYLE
  }

  /**
   * Private method to handle all log types with consistent formatting
   * @param message - Log message text
   * @param data - Optional data to include in the log
   * @param level - Log level to use
   */
  private log(message: string, data?: any, level: LogLevel = LogLevel.LOG): void {
    if (!this.enabled) return

    const formattedMessage = `%c ${this.prefix} %c${message}`

    switch (level) {
      case LogLevel.INFO:
        console.info(formattedMessage, this.style, 'color: #fff', data)
        break
      case LogLevel.WARN:
        console.warn(formattedMessage, this.style, 'color: #fff', data)
        break
      case LogLevel.ERROR:
        console.error(formattedMessage, this.style, 'color: #fff', data)
        break
      case LogLevel.DEBUG:
        console.debug(formattedMessage, this.style, 'color: #fff', data)
        break
      default:
        console.log(formattedMessage, this.style, 'color: #fff', data)
    }
  }

  public logGeneric(message: string, data?: any): void {
    this.log(message, data)
  }

  public info(message: string, data?: any): void {
    this.log(message, data, LogLevel.INFO)
  }

  public warn(message: string, data?: any): void {
    this.log(message, data, LogLevel.WARN)
  }

  public error(message: string, data?: any): void {
    this.log(message, data, LogLevel.ERROR)
  }

  public debug(message: string, data?: any): void {
    this.log(message, data, LogLevel.DEBUG)
  }

  public setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  public createChildLogger(prefix: string): Logger {
    return new Logger({
      enabled: this.enabled,
      prefix: `${this.prefix}:${prefix}`,
      style: this.style
    })
  }
}

export const logger = new Logger()

export const createLogger = (namespace: string): Logger => {
  return logger.createChildLogger(namespace)
}
