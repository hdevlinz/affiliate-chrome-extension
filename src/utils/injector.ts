import { logger } from './logger'

export const injector = {
  injectSidePanel: () => {
    logger.info('Injector Script: Injecting side panel')

    const aduSidePanelDiv = document.createElement('div')
    aduSidePanelDiv.id = 'adu-sidepanel-container'
    document.body.appendChild(aduSidePanelDiv)

    const aduIframe = document.createElement('iframe')
    aduIframe.id = 'adu-sidepanel-iframe'
    aduIframe.src = chrome.runtime.getURL('templates/sidepanel.html')
    aduSidePanelDiv.appendChild(aduIframe)

    const aduCloseButton = document.createElement('span')
    aduCloseButton.innerHTML = 'X'
    aduCloseButton.id = 'adu-sidepanel-close-icon'
    aduCloseButton.onclick = () => aduSidePanelDiv.remove()
    aduSidePanelDiv.appendChild(aduCloseButton)

    const aduSpliter = document.createElement('div')
    aduSpliter.id = 'adu-sidepanel-spliter'
    aduSidePanelDiv.appendChild(aduSpliter)

    const root = document.documentElement
    const spliter = aduSpliter
    const cd1 = aduSidePanelDiv
    let isDown = false
    let isHover = false
    let minWidth = 200
    let maxWidth = window.innerWidth - 50

    const setPosition = () => {
      minWidth = 200
      maxWidth = window.innerWidth - 50
    }

    const moveTo = (e: MouseEvent) => {
      if (isDown) {
        let newWidth = window.innerWidth - e.clientX - 10
        if (newWidth > minWidth && newWidth < maxWidth) {
          cd1.style.width = newWidth + 'px'
        }
      }
    }

    window.addEventListener('resize', (e) => setPosition())

    root.addEventListener(
      'mousedown',
      (e) => {
        if (isHover) {
          isDown = true
        }
      },
      true
    )

    root.addEventListener(
      'mouseup',
      (e) => {
        isDown = false
        if (isHover) {
          //...
        }
      },
      true
    )

    root.addEventListener('mousemove', (e) => {
      if (isDown) {
        moveTo(e)
      }
    })

    spliter.addEventListener('mouseenter', (e) => {
      isHover = true
      spliter.style.cursor = 'col-resize'
    })

    spliter.addEventListener('mouseout', (e) => {
      isHover = false
      spliter.style.cursor = 'default'
    })
  },

  injectExternalJS: (src: string) => {
    const scriptElement = document.createElement('script')
    scriptElement.setAttribute('type', 'text/javascript')
    scriptElement.setAttribute('src', src)
    document.documentElement.appendChild(scriptElement)
  },

  injectExternalCSS: (href: string) => {
    const linkElement = document.createElement('link')
    linkElement.setAttribute('rel', 'stylesheet')
    linkElement.setAttribute('type', 'text/css')
    linkElement.setAttribute('href', href)
    document.documentElement.appendChild(linkElement)
  }
}
