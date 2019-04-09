import { updateState, state } from './state'
import { getById } from '../views/dom'

import darkModeStyles from '../../css/dark-mode.css'

export function createIframe(browserDocument, assistStyles, style = {}) {
  const { darkMode } = style

  const initialIframeContent = `
    <html>
      <head>
        <style>
          ${assistStyles}
        </style>
        <style>
          ${darkMode ? darkModeStyles : ''}
        </style>
      </head>
      <body></body>
    </html>
  `

  const iframe = browserDocument.createElement('iframe')
  browserDocument.body.appendChild(iframe)
  iframe.style.position = 'fixed'
  iframe.style.top = '0'
  iframe.style.left = '0'
  iframe.style.height = '100vh'
  iframe.style.width = '100%'
  iframe.style.border = 'none'
  iframe.style.pointerEvents = 'none'
  iframe.style['z-index'] = 999
  const iWindow = iframe.contentWindow
  const iDocument = iWindow.document
  iDocument.open()
  iDocument.write(initialIframeContent)
  iDocument.close()

  updateState({ iframe, iframeDocument: iDocument, iframeWindow: iWindow })
}

export function setupIframe(notificationsList) {
  state.iframe.style.top = ''
  state.iframe.style.left = ''
  state.iframe.style.bottom = '0px'
  state.iframe.style.right = '0px'
  state.iframe.style.height = `${
    Number(notificationsList.clientHeight) +
    Number(getById('bn-transaction-branding').clientHeight) +
    7 + // for some reason the bn-logo clips if this is not included
      40 // this is the height of the progress-tooltip
  }px`
  state.iframe.style.width = `${
    notificationsList.clientWidth + 17 // 17px is the width of the scrollbar
  }px`
  state.iframe.style.pointerEvents = 'all'
}

// Set the iframe to the size of the notification list
export function resizeIframe() {
  const notificationsContainer = getById('blocknative-notifications')
  if (notificationsContainer) {
    state.iframe.style.height = `${notificationsContainer.clientHeight}px`
    state.iframe.style.width = `${notificationsContainer.clientWidth}px`
    state.iframe.style.pointerEvents = 'all'
  }
}

export function resetIframe() {
  state.iframe.style.top = '0px'
  state.iframe.style.left = '0px'
  state.iframe.style.bottom = ''
  state.iframe.style.right = ''
  state.iframe.style.height = '100vh'
  state.iframe.style.width = '100%'
  state.iframe.style.pointerEvents = 'none'
}
