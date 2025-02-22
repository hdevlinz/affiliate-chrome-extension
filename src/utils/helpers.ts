import { merge } from 'lodash'

export const mergeDict = (dict1: any, dict2: any): Record<string, unknown> => {
  if (
    (typeof dict1 !== 'string' && typeof dict1 !== 'object') ||
    (typeof dict2 !== 'string' && typeof dict2 !== 'object')
  )
    return {}

  if (typeof dict1 === 'string') {
    try {
      dict1 = JSON.parse(dict1)
    } catch (error) {
      dict1 = {}
    }
  }

  if (typeof dict2 === 'string') {
    try {
      dict2 = JSON.parse(dict2)
    } catch (error) {
      dict2 = {}
    }
  }

  return merge({}, dict1, dict2)
}
