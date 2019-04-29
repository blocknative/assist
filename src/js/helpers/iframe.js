import { positionElement } from 'js/views/dom'
import darkModeStyles from 'css/dark-mode.css'

import { updateState, state } from './state'

export function createIframe(browserDocument, assistStyles, style = {}) {
  const { darkMode, css } = style

  const initialIframeContent = `
    <html>
      <head>
        <style>
          ${assistStyles}
        </style>
        <style>
          ${darkMode ? darkModeStyles : ''}
        </style>
        <style>
          ${css || ''}
        </style>
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
}

export function showIframe() {
  state.iframe.style['z-index'] = 999
  state.iframe.style.pointerEvents = 'all'
}

export function hideIframe() {
  state.iframe.style['z-index'] = 'initial'
  state.iframe.style.pointerEvents = 'none'
}

export function resizeIframe({ height, width, transitionHeight }) {
  if (transitionHeight) {
    state.iframe.style.transition = 'height 200ms ease-in-out'
  } else {
    state.iframe.style.transition = 'initial'
  }

  state.iframe.style.height = `${height}px`
  state.iframe.style.width = `${width}px`
}
