console.info('contentScript is running')

let isCapturing = false

chrome.runtime.onMessage.addListener((message) => {
  console.log('Received message:', message)
  switch (message.action) {
    case 'start':
      isCapturing = true
      console.log('Request capturing started')
      break
    case 'stop':
      isCapturing = false
      console.log('Request capturing stopped')
      break
    default:
      console.warn('Unknown action:', message.action)
  }
})

const XHR = XMLHttpRequest.prototype

const customOpen = XHR.open
const send = XHR.send

interface CustomXMLHttpRequest extends XMLHttpRequest {
  requestMethod?: string
  requestURL?: string
}

XHR.open = function (this: CustomXMLHttpRequest, method: string, url: string): void {
  this.requestMethod = method
  this.requestURL = url
  customOpen.apply(this, arguments as any)
}

XHR.send = function (
  this: CustomXMLHttpRequest,
  postData?: Document | XMLHttpRequestBodyInit | null,
): void {
  if (!isCapturing) return send.apply(this, arguments as any)

  this.addEventListener('load', function () {
    try {
      const responseData = JSON.parse(this.responseText)
      console.log({
        url: (this as CustomXMLHttpRequest).requestURL,
        method: (this as CustomXMLHttpRequest).requestMethod,
        requestHeaders: this.getAllResponseHeaders(),
        requestData: postData,
        responseData: responseData,
        status: this.status,
      })
    } catch (e) {
      console.log('Non-JSON response:', this.responseText)
    }
  })

  send.apply(this, arguments as any)
}

const originalFetch = window.fetch
window.fetch = async function (...args: Parameters<typeof fetch>): Promise<Response> {
  if (!isCapturing) return originalFetch(...args)

  const request = args[0]
  const config = args[1]

  try {
    const response = await originalFetch(...args)
    const clone = response.clone()
    let responseData: any

    try {
      responseData = await clone.json()
    } catch {
      responseData = 'Non-JSON response'
    }

    console.log({
      url:
        typeof request === 'string'
          ? request
          : request instanceof Request
            ? request.url
            : request.toString(),
      method: config?.method || 'GET',
      requestHeaders: config?.headers,
      requestData: config?.body,
      responseData: responseData,
      status: response.status,
    })

    return response
  } catch (e) {
    console.error('Error intercepting fetch:', e)
    return originalFetch(...args)
  }
}
