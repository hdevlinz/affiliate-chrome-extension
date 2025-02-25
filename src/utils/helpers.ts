import { transform } from 'lodash'
import { isObject } from './checks'

export const deepOmit = (obj: any, keysToOmit: string | string[]) => {
  const keysToOmitArray = Array.isArray(keysToOmit) ? keysToOmit : [keysToOmit]

  const omitFromObject = (o: any) => {
    return transform(o, (result: any, value: any, key: any) => {
      if (keysToOmitArray.indexOf(key) !== -1) return

      if (Array.isArray(value)) {
        result[key] = value.map((item) => (isObject(item) ? omitFromObject(item) : item))
      } else {
        result[key] = isObject(value) ? omitFromObject(value) : value
      }
    })
  }

  return omitFromObject(obj)
}

export const deepFlatten = (obj: any) => {
  const flatten = (o: any): any => {
    if (typeof o === 'object' && o !== null) {
      if (Array.isArray(o)) return o.map((item) => flatten(item))

      const newObj: { [key: string]: any } = {}
      for (const key in o) {
        if (o.hasOwnProperty(key)) {
          const value = o[key]

          if (typeof value === 'object' && value !== null) {
            if (Object.keys(value).length === 0) {
              newObj[key] = null
            } else if (Object.keys(value).length === 1 && value.hasOwnProperty('value')) {
              newObj[key] = flatten(value.value)
            } else {
              newObj[key] = flatten(value)
            }
          } else if (Array.isArray(value)) {
            newObj[key] = value.map((item) => flatten(item))
          } else {
            newObj[key] = value
          }
        }
      }

      return newObj
    }

    return o
  }

  return flatten(obj)
}
