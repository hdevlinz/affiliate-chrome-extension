const ENDPOINTS = { FIND: '/api/v1/oec/affiliate/creator/marketplace/find' }

const XHR = XMLHttpRequest.prototype
const originalFetch = window.fetch
const open = XHR.open
const send = XHR.send

XHR.open = function (method, url) {
  this.requestMethod = method
  this.requestURL = url

  return open.apply(this, arguments)
}

XHR.send = function (postData) {
  const self = this

  self.addEventListener('load', () => {
    if (!Object.values(ENDPOINTS).some((endpoint) => self.requestURL.includes(endpoint))) return

    try {
      const url = window.location.origin + self.requestURL
      const queryParams = getQueryParams(url)
      const requestHeaders = getHeaders(self.getAllResponseHeaders())
      const responsePayload = JSON.parse(self.responseText)

      // Only send the first page of the response
      if (responsePayload && responsePayload.next_pagination && responsePayload.next_pagination.next_page === 1) {
        sendData({
          url: url,
          method: self.requestMethod,
          query: queryParams,
          status: self.status,
          requestHeaders: requestHeaders,
          requestPayload: postData,
          responsePayload: responsePayload
        })
      }
    } catch (error) {
      console.error(`error intercepting XHR: ${error}`)
    }
  })

  return send.apply(this, arguments)
}

window.fetch = async function (...args) {
  const request = args[0]
  const config = args[1]

  const url =
    window.location.origin +
    (typeof request === 'string' ? request : request instanceof Request ? request.url : request.toString())

  if (!Object.values(ENDPOINTS).some((endpoint) => url.includes(endpoint))) return originalFetch(...args)

  try {
    const response = await originalFetch(...args)
    const clone = response.clone()

    const queryParams = getQueryParams(url)
    const responsePayload = await clone.json()

    // Only send the first page of the response
    if (responsePayload && responsePayload.next_pagination && responsePayload.next_pagination.next_page === 1) {
      sendData({
        url: url,
        method: config?.method || 'GET',
        query: queryParams,
        status: response.status,
        requestHeaders: config?.headers,
        requestPayload: config?.body,
        responsePayload: responsePayload
      })
    }

    return response
  } catch (error) {
    console.error(`error intercepting fetch: ${error}`)

    return originalFetch(...args)
  }
}

const sendData = (data) => window.postMessage({ type: 'adu_affiliate', action: 'fetch_data', payload: data }, '*')

const getQueryParams = (urlString) => {
  try {
    const urlObject = new URL(urlString)
    return Object.fromEntries(urlObject.searchParams)
  } catch (error) {
    console.error(`error parsing query params: ${error}`)
    return {}
  }
}

const getHeaders = (headersString) => {
  try {
    return headersString
      .trim()
      .split('\n')
      .reduce((headers, line) => {
        const [name, value] = line.split(':').map((s) => s.trim())
        if (name && value) headers[name] = value
        return headers
      }, {})
  } catch (error) {
    console.error(`error parsing headers: ${error}`)
    return {}
  }
}
