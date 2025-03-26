export const isDev = process.env.NODE_ENV == 'development'
export const logStyle = 'color: #a394ff; background: #28243d;'

export enum ConsoleType {
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug'
}

class Logger {
  private log(message: string, data?: any, level: ConsoleType = ConsoleType.LOG) {
    if (!isDev) return

    switch (level) {
      case ConsoleType.INFO: {
        console.info(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
        break
      }

      case ConsoleType.WARN: {
        console.warn(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
        break
      }

      case ConsoleType.ERROR: {
        console.error(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
        break
      }

      case ConsoleType.DEBUG: {
        console.debug(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
      }

      default: {
        console.log(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
      }
    }
  }

  public logGeneric(message: string, data?: any) {
    this.log(message, data)
  }

  public info(message: string, data?: any) {
    this.log(message, data, ConsoleType.INFO)
  }

  public warn(message: string, data?: any) {
    this.log(message, data, ConsoleType.WARN)
  }

  public error(message: string, data?: any) {
    this.log(message, data, ConsoleType.ERROR)
  }

  public debug(message: string, data?: any) {
    this.log(message, data, ConsoleType.DEBUG)
  }
}

export const logger = new Logger()
