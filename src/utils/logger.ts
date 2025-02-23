import { ConsoleType } from '../types/enums'

const isDev = process.env.NODE_ENV == 'development'
const logStyle = 'color: #a394ff; background: #28243d;'

export const logger = (obj: { message: string; data?: any; level?: ConsoleType }) => {
  if (!isDev) return

  const { message, data, level } = obj
  switch (level) {
    case ConsoleType.INFO:
      console.info(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
      break
    case ConsoleType.WARN:
      console.warn(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
      break
    case ConsoleType.ERROR:
      console.error(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
      break
    default:
      console.log(`%c ADU %c${message}`, logStyle, 'color: #fff', data)
  }
}
