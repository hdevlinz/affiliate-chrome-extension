import { logger } from './logger'

export const injector = {
  injectSidePanel: () => {
    logger.info('Injector Script: Injecting side panel')

    const sidePanelDiv = document.createElement('div')
    sidePanelDiv.id = 'sidepanel-container'
    document.body.appendChild(sidePanelDiv)

    const iframe = document.createElement('iframe')
    iframe.id = 'sidepanel-iframe'
    iframe.src = chrome.runtime.getURL('templates/sidepanel.html')
    sidePanelDiv.appendChild(iframe)

    const closeButton = document.createElement('span')
    closeButton.innerHTML = 'X'
    closeButton.id = 'sidepanel-close-icon'
    closeButton.onclick = () => sidePanelDiv.remove()
    sidePanelDiv.appendChild(closeButton)

    const spliterDiv = document.createElement('div')
    spliterDiv.id = 'sidepanel-spliter'
    sidePanelDiv.appendChild(spliterDiv)

    const root = document.documentElement
    const spliter = spliterDiv
    const cd1 = sidePanelDiv
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
