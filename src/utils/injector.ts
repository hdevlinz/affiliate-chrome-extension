import { ConsoleType } from '../types/enums'
import { logger } from './logger'

export const injector = {
  injectSidePanel: () => {
    logger({
      message: 'Injector Script: Injecting side panel',
      level: ConsoleType.INFO,
    })

    const aduSidePanelDiv = document.createElement('div')
    aduSidePanelDiv.id = 'adu-sidepanel-container'
    aduSidePanelDiv.style.cssText = `
        position: fixed;
        top: .625rem;
        right: .625rem;
        width: 31.25rem;
        height: 98vh;
        border: .0625rem solid #ccc;
        box-shadow: 0 .125rem .3125rem rgba(0,0,0,0.2);
        z-index: 1000;
        overflow: hidden;
        border-radius: .5rem;
        background-color: white;
        cursor: default;
        display: flex;
        flex-direction: row-reverse;
        user-select: none;
      `
    document.body.appendChild(aduSidePanelDiv)

    const aduIframe = document.createElement('iframe')
    aduIframe.id = 'adu-sidepanel-iframe'
    aduIframe.src = chrome.runtime.getURL('templates/sidepanel.html')
    aduIframe.style.cssText = `
        width: 100%;
        height: 100%;
        border: none;
      `
    aduSidePanelDiv.appendChild(aduIframe)

    const aduCloseButton = document.createElement('span')
    aduCloseButton.innerHTML = 'X'
    aduCloseButton.className = 'adu-sidepanel-close-icon'
    aduCloseButton.style.cssText = `
        position: absolute;
        top: 5px;
        right: 10px;
        cursor: pointer;
        font-size: 1.2rem;
        color: #777;
        z-index: 10;  /* Ensure close button is above iframe */
      `
    aduCloseButton.onclick = () => aduSidePanelDiv.remove()
    aduSidePanelDiv.appendChild(aduCloseButton)

    const aduSpliter = document.createElement('div')
    aduSpliter.className = 'adu-sidepanel-spliter'
    aduSpliter.style.cssText = `
        width: 5px;
        height: 100%;
        background: #c96d6d;
        cursor: col-resize;
        position: relative;
        z-index: 5; /* Ensure splitter is above iframe but below close button */
      `
    aduSidePanelDiv.appendChild(aduSpliter)

    let root = document.documentElement
    let spliter = aduSpliter
    let cd1 = aduSidePanelDiv
    var isDown = false
    var isHover = false
    var minWidth = 200
    var maxWidth = window.innerWidth - 50

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
      true,
    )

    root.addEventListener(
      'mouseup',
      (e) => {
        isDown = false
        if (isHover) {
          //...
        }
      },
      true,
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
  },
}
