import { isToday } from './validators'

export const kFormatter = (num: number) => {
  const regex = /\B(?=(\d{3})+(?!\d))/g

  return Math.abs(num) > 9999
    ? `${Math.sign(num) * +(Math.abs(num) / 1000).toFixed(1)}k`
    : Math.abs(num).toFixed(0).replace(regex, ',')
}

export const getFormattedDate = () => {
  const now = new Date()
  return `${now.getDate()}_${now.getMonth() + 1}_${now.getFullYear()}`
}

export const formatDate = (
  value: string,
  formatting: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }
) => {
  if (!value) return value

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

export const formatDateToMonthShort = (value: string, toTimeForCurrentDay = true) => {
  const date = new Date(value)
  let formatting: Record<string, string> = { month: 'short', day: 'numeric' }

  if (toTimeForCurrentDay && isToday(date)) formatting = { hour: 'numeric', minute: 'numeric' }

  return new Intl.DateTimeFormat('en-US', formatting).format(new Date(value))
}

export const dateToTimeAgoString = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  let interval = seconds / 31536000

  if (interval > 1) return `${Math.floor(interval)} years`

  interval = seconds / 2592000
  if (interval > 1) return `${Math.floor(interval)} months`

  interval = seconds / 86400
  if (interval > 1) return `${Math.floor(interval)} days`

  interval = seconds / 3600
  if (interval > 1) return `${Math.floor(interval)} hours`

  interval = seconds / 60
  if (interval > 1) return `${Math.floor(interval)} minutes`

  return `${Math.floor(seconds)} seconds`
}

export const formatDateToTimeAgoString = (value?: string | null) => {
  if (!value) return '-'

  const date = new Date(value)

  return `${formatDate(value)} (${dateToTimeAgoString(date)} ago)`
}

export function formatNumber(value: any) {
  if (value === undefined || value === null) return '-'

  if (typeof value === 'string') {
    try {
      value = Number.parseInt(value)
    } catch (e) {
      return value
    }
  }

  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`

  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`

  if (value >= 1_000) return `${(value / 1_000).toFixed(2)}K`

  return value.toString()
}

export const formatBytes = (value: number, unit: 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' = 'bytes') => {
  if (typeof value !== 'number' || value < 0) return '-'

  const units = ['bytes', 'KB', 'MB', 'GB', 'TB']
  const index = units.indexOf(unit)
  let convertedValue = value

  for (let i = 0; i < index; i++) convertedValue /= 1024

  if (convertedValue <= 0) return `${value.toFixed(2)} ${units[0]}`

  return `${convertedValue.toFixed(2)} ${unit}`
}

export const formatSeconds = (seconds?: number | null) => {
  if (!seconds) return null

  let interval = seconds / 31536000

  if (interval > 1) return `${Math.floor(interval)} years`

  interval = seconds / 2592000
  if (interval > 1) return `${Math.floor(interval)} months`

  interval = seconds / 86400
  if (interval > 1) return `${Math.floor(interval)} days`

  interval = seconds / 3600
  if (interval > 1) return `${Math.floor(interval)} hours`

  interval = seconds / 60
  if (interval > 1) return `${Math.floor(interval)} minutes`

  return `${Math.floor(seconds)} seconds`
}
