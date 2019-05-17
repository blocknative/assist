import { positionElement, updateNotificationsPosition } from '~/js/views/dom'
import darkModeStyles from '~/css/dark-mode.css'

import { updateState, state } from './state'

export function updateStyle({ darkMode, css, notificationsPosition }) {
  const { iframeDocument } = state
  const darkModeStyleElement = iframeDocument.getElementById('dark-mode-style')
  const customCssStyleElement = iframeDocument.getElementById(
    'custom-css-style'
  )

  // update darkMode
  if (typeof darkMode === 'boolean') {
    const newConfig = {
      ...state.config,
      style: {
        ...state.config.style,
        darkMode
      }
    }
    darkModeStyleElement.innerHTML = darkMode ? darkModeStyles : ''
    updateState({ config: newConfig })
  }

  // update custom css
  if (css) {
    const newConfig = {
      ...state.config,
      style: {
        ...state.config.style,
        css
      }
    }
    customCssStyleElement.innerHTML = css
    updateState({ config: newConfig })
  }

  // update notifications position
  if (notificationsPosition) {
    const newConfig = {
      ...state.config,
      style: {
        ...state.config.style,
        notificationsPosition
      }
    }
    updateState({
      config: newConfig
    })
    updateNotificationsPosition()
  }
}

export function createIframe(browserDocument, assistStyles, style = {}) {
  const initialIframeContent = `
    <html>
      <head>
        <style>
          ${assistStyles}
        </style>
        <style id="dark-mode-style"></style>
        <style id="custom-css-style"></style>
      </head>
      <body></body>
    </html>
  `

  const iframe = positionElement(browserDocument.createElement('iframe'))
  browserDocument.body.appendChild(iframe)
  iframe.style.position = 'fixed'
  iframe.style.height = '0'
  iframe.style.width = '0'
  iframe.style.border = 'none'
  iframe.style.pointerEvents = 'none'
  iframe.style.overflow = 'hidden'
  const iWindow = iframe.contentWindow
  const iDocument = iWindow.document
  iDocument.open()
  iDocument.write(initialIframeContent)
  iDocument.close()

  updateState({ iframe, iframeDocument: iDocument, iframeWindow: iWindow })
  updateStyle(style)
}

export function showIframe() {
  state.iframe.style['z-index'] = 999
  state.iframe.style.pointerEvents = 'all'
}

export function hideIframe() {
  state.iframe.style['z-index'] = 'initial'
  state.iframe.style.pointerEvents = 'none'
}

export async function resizeIframe({ height, width, transitionHeight }) {
  if (transitionHeight) {
    state.iframe.style.transition = 'height 200ms ease-in-out'
  } else {
    state.iframe.style.transition = 'initial'
  }

  state.iframe.style.height = `${height}px`
  state.iframe.style.width = `${width}px`
}
