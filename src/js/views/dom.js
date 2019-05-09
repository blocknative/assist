import { state } from '~/js/helpers/state'
import {
  capitalize,
  timeString,
  timeouts,
  stepToImageKey,
  first
} from '~/js/helpers/utilities'
import { showIframe, hideIframe, resizeIframe } from '~/js/helpers/iframe'

import {
  onboardHeading,
  onboardDescription,
  onboardButton,
  imageSrc,
  notSupported,
  onboardWarningMsg
} from './content'

export function createElementString(type, className, innerHTML) {
  return `
	  <${type} class="${className}">
	    ${innerHTML}
	  </${type}>
	`
}

export function createElement(el, className, children, id) {
  const element = state.iframeDocument.createElement(el)
  element.className = className || ''

  if (children && typeof children === 'string') {
    element.innerHTML = children
  }

  if (children && typeof children === 'object') {
    element.appendChild(children)
  }

  if (id) {
    element.id = id
  }

  return element
}

const handleWindowResize = () =>
  resizeIframe({ height: window.innerHeight, width: window.innerWidth })

export function closeModal() {
  window.removeEventListener('resize', handleWindowResize)
  const modal = state.iframeDocument.querySelector('.bn-onboard-modal-shade')
  modal.style.opacity = '0'

  const notifications = getById('blocknative-notifications')
  if (notifications) {
    resizeIframe({
      height: notifications.clientHeight,
      width: notifications.clientWidth
    })
  } else {
    hideIframe()
  }

  setTimeout(() => {
    state.iframeDocument.body.removeChild(modal)
  }, timeouts.removeElement)
}

export function openModal(modal, handlers = {}) {
  const { onClick, onClose } = handlers
  window.addEventListener('resize', handleWindowResize)
  state.iframeDocument.body.appendChild(modal)
  showIframe()
  resizeIframe({ height: window.innerHeight, width: window.innerWidth })

  const closeButton = state.iframeDocument.querySelector('.bn-onboard-close')
  closeButton.onclick = () => {
    onClose && onClose()
    closeModal()
  }

  const completeStepButton = modal.querySelector('.bn-btn')
  if (completeStepButton) {
    completeStepButton.onclick = () => {
      onClick && onClick()
    }
  }

  setTimeout(() => {
    modal.style.opacity = '1'
  }, timeouts.endOfEventQueue)
}

export function notSupportedImage(type) {
  const imageUrl = imageSrc[type]
  return `
	  <img
	    src="${imageUrl.src}"
	    alt ="${capitalize(type)}Not Supported"
	    srcset="${imageUrl.srcset} 2x" />
  `
}

export function browserLogos() {
  const { chromeLogo, firefoxLogo } = imageSrc
  return `
    <p>
      <a href="https://www.google.com/chrome/" target="_blank" class="bn-btn bn-btn-primary bn-btn-outline text-center">
      <img
        src="${chromeLogo.src}" 
        alt="Chrome Logo" 
        srcset="${chromeLogo.srcset} 2x" />
      <br>
      Chrome
      </a>
      <a href="https://www.mozilla.org/en-US/firefox/" target="_blank" class="bn-btn bn-btn-primary bn-btn-outline text-center">
      <img
        src="${firefoxLogo.src}" 
        alt="Firefox Logo" 
        srcset="${firefoxLogo.srcset} 2x" />
      <br>
      Firefox
      </a>
    </p>
  `
}

export function onboardBranding() {
  const { blockNativeLogo, blockNativeLogoLight } = imageSrc
  const { style } = state.config
  const darkMode = style && style.darkMode

  return `
    <div class="bn-onboarding-branding">
      <p>Powered by
      <a href="https://www.blocknative.com/" target="_blank">
      <img
        src="${darkMode ? blockNativeLogoLight.src : blockNativeLogo.src}" 
        alt="Blocknative" 
        srcset="${
          darkMode ? blockNativeLogoLight.srcset : blockNativeLogo.srcset
        } 2x" />
      </a>
      </p>
    </div>
  `
}

export function notSupportedModal(type) {
  const info = notSupported[`${type}NotSupported`]
  const { style } = state.config
  const darkMode = style && style.darkMode

  return `
    <div id="bn-${type}-not-supported" class="bn-onboard">
      <div class="bn-onboard-modal bn-onboard-alert">
        <a href="#" class="bn-onboard-close">
          <span class="bn-onboard-close-x"></span>
        </a>
        ${notSupportedImage(`${type}${darkMode ? 'Light' : ''}`)}
        <br><br>
        <h1 class="h4">${info.heading}</h1>
        <p>${info.description()}</p>
        <br>
        ${type === 'browser' ? `${browserLogos()}<br>` : ''}
        ${onboardBranding()}
      </div>
    </div>
  `
}

export function onboardSidebar(step) {
  return `
    <div class="bn-onboard-sidebar">
      <h4>Setup Tasks</h4>
      <ul class="bn-onboard-list">
        <li class=${
          step < 1 ? 'bn-inactive' : step > 1 ? 'bn-check' : 'bn-active'
        }>
          <span class="bn-onboard-list-sprite"></span> ${
            onboardHeading[1].basic
          }
        </li>
        <li class=${
          step < 2 ? 'bn-inactive' : step > 2 ? 'bn-check' : 'bn-active'
        }>
          <span class="bn-onboard-list-sprite"></span> ${
            onboardHeading[2].basic
          }
        </li>
        <li class=${
          step < 3 ? 'bn-inactive' : step > 3 ? 'bn-check' : 'bn-active'
        }>
          <span class="bn-onboard-list-sprite"></span> ${
            onboardHeading[3].basic
          }
        </li>
        <li class=${
          step < 4 ? 'bn-inactive' : step > 4 ? 'bn-check' : 'bn-active'
        }>
          <span class="bn-onboard-list-sprite"></span> ${
            onboardHeading[4].basic
          }
        </li>
        <li class=${
          step < 5 ? 'bn-inactive' : step > 5 ? 'bn-check' : 'bn-active'
        }>
          <span class="bn-onboard-list-sprite"></span> ${
            onboardHeading[5].basic
          }
        </li>
      </ul>
      ${onboardBranding()}
    </div>
  `
}

export function onboardMain(type, step) {
  const heading = onboardHeading[step][type]
  const description = onboardDescription[step][type]()
  const buttonText =
    typeof onboardButton[step][type] === 'function'
      ? onboardButton[step][type]()
      : onboardButton[step][type]

  const defaultImages = imageSrc[step]

  const { images } = state.config
  const stepKey = stepToImageKey(step)
  const devImages = images && images[stepKey]

  return `
    <img
      src="${(devImages && devImages.src) || defaultImages.src}" 
      class="bn-onboard-img" 
      alt="Blocknative" 
      srcset="${(devImages && devImages.srcset && devImages.srcset) ||
        defaultImages.srcset} 2x"/>
    <br>
    <h1 class="h4">${heading}</h1>
    <p>${description}</p>
    <br>
    <br>
    <p class="bn-onboard-button-section">
      <a href="#"
         class="bn-btn bn-btn-primary bn-btn-outline">${buttonText}
      </a>
    </p>
  `
}

export function onboardModal(type, step) {
  return `
    <div id="bn-user-${type}" class="bn-onboard">
      <div class="bn-onboard-modal bn-onboard-${type} ${
    type === 'basic' ? 'clearfix' : ''
  }">
        <a href="#" class="bn-onboard-close">
          <span class="bn-onboard-close-x"></span>
        </a>
        ${type === 'basic' ? onboardSidebar(step) : ''}
				${
          type === 'basic'
            ? createElementString(
                'div',
                'bn-onboard-main',
                onboardMain(type, step)
              )
            : onboardMain(type, step)
        }
        ${type === 'advanced' ? `<br>${onboardBranding()}` : ''}
      </div>
    </div>
  `
}

export function addOnboardWarning(msgType) {
  const existingWarning = getByQuery('.bn-onboard-warning')
  if (existingWarning) {
    return
  }

  const warning = createElement(
    'span',
    'bn-onboard-warning',
    onboardWarningMsg(msgType)
  )

  const spacer = createElement('br')
  const basicModal = getByQuery('.bn-onboard-main')

  if (basicModal) {
    basicModal.appendChild(spacer)
    basicModal.appendChild(warning)
  } else {
    const modal = getByQuery('.bn-onboard-modal')
    const branding = modal.querySelector('.bn-onboarding-branding')
    modal.insertBefore(warning, branding)
  }
}

export function getById(id) {
  return state.iframeDocument.getElementById(id)
}

export function getByQuery(query) {
  return state.iframeDocument.querySelector(query)
}

export function getAllByQuery(query) {
  return Array.from(state.iframeDocument.querySelectorAll(query))
}

export function createTransactionBranding() {
  const blockNativeBrand = createElement(
    'a',
    null,
    null,
    'bn-transaction-branding'
  )
  blockNativeBrand.href = 'https://www.blocknative.com/'
  blockNativeBrand.target = '_blank'
  const position =
    (state.config.style && state.config.style.notificationsPosition) || ''
  blockNativeBrand.style.float = position.includes('Left') ? 'initial' : 'right'

  return blockNativeBrand
}

export function notificationContent(type, message, time = {}) {
  const { showTime, startTime, timeStamp } = time
  const elapsedTime = timeString(Date.now() - startTime)
  const position =
    (state.config.style && state.config.style.notificationsPosition) || ''

  return `
		<span class="bn-status-icon ${
      position.includes('Left') ? 'bn-float-right' : ''
    }">
      ${
        type === 'progress'
          ? `<div class="progress-tooltip ${
              position.includes('Left') ? 'bn-left' : ''
            }">
				<div class="progress-tooltip-inner">
					You will be notified when this transaction is completed.
				</div>
			</div>`
          : ''
      }
		</span>
		<div class="bn-notification-info">
			<p>${message}</p>
			<p class="bn-notification-meta">
				<a href="#" class="bn-timestamp">${timeStamp}</a>
				<span class="bn-duration${showTime ? '' : ' bn-duration-hidden'}"> - 
					<i class="bn-clock"></i>
					<span class="bn-duration-time">${elapsedTime}</span>
				</span>
			</p>
		</div>
	`
}

// Start clock
export function startTimerInterval(notificationId, eventCode, startTime) {
  const notification = first(
    getAllByQuery(`.bn-${notificationId}`).filter(n =>
      n.classList.contains(`bn-${eventCode}`)
    )
  )

  if (!notification) {
    return null
  }

  const intervalId = setInterval(() => {
    const timeContainer = notification.querySelector('.bn-duration')
    if (timeContainer.classList.contains('bn-duration-hidden')) {
      timeContainer.classList.remove('bn-duration-hidden')
    }

    const durationContainer = timeContainer.querySelector('.bn-duration-time')
    const elapsedTime = timeString(Date.now() - startTime)
    durationContainer.innerHTML = `${elapsedTime}`
  }, 1000)

  return intervalId
}

export function showElement(element, timeout) {
  setTimeout(() => {
    element.style.opacity = '1'
    element.style.transform = 'translateX(0)'
  }, timeout)
}

export function hideElement(element) {
  setTimeout(() => {
    element.style.opacity = '0'
    element.style.transform = `translateX(${getPolarity()}600px)`
  }, timeouts.hideElement)
}

export function removeElement(parent, element) {
  setTimeout(() => {
    if (parent && parent.contains(element)) {
      parent.removeChild(element)
      if (parent !== state.iframeDocument.body) {
        checkIfNotifications()
      }
    }
  }, timeouts.removeElement)
}

function getPolarity() {
  const position =
    (state.config.style && state.config.style.notificationsPosition) || ''

  return position.includes('Left') ? '-' : ''
}

export function offsetElement(el) {
  el.style.transform = `translate(${getPolarity()}600px)`
  return el
}

export function positionElement(el) {
  const position =
    (state.config.style && state.config.style.notificationsPosition) || ''

  el.style.left = position.includes('Left') ? '0px' : 'initial'
  el.style.right = position.includes('Right') || !position ? '0px' : 'initial'
  el.style.bottom = position.includes('bottom') || !position ? '0px' : 'initial'
  el.style.top = position.includes('top') ? '0px' : 'initial'

  return el
}

// Remove notification from DOM
export function removeNotification(notification) {
  const notificationsList = getByQuery('.bn-notifications')
  hideElement(notification)
  removeElement(notificationsList, notification)
  const scrollContainer = getByQuery('.bn-notifications-scroll')
  if (scrollContainer) {
    setTimeout(
      () => setHeight(scrollContainer, 'initial', 'auto'),
      timeouts.changeUI
    )
  }
}

export function removeAllNotifications(notifications) {
  notifications.forEach(notification => {
    if (notification) {
      removeNotification(notification)
    }
  })
}

export function checkIfNotifications() {
  const notificationsList = getByQuery('.bn-notifications')
  const allNotifications = Array.from(
    notificationsList.querySelectorAll('.bn-notification')
  )
  const visibleNotifications = allNotifications.filter(
    notification => notification.style.opacity !== '0'
  )

  if (visibleNotifications.length === 0) {
    removeContainer()
  }
}

// Remove notification container from DOM
export function removeContainer() {
  const notificationsContainer = getById('blocknative-notifications')
  hideElement(notificationsContainer)
  removeElement(state.iframeDocument.body, notificationsContainer)
  resizeIframe({ height: 0, width: 0 })
  hideIframe()
}

export function setNotificationsHeight() {
  const scrollContainer = getByQuery('.bn-notifications-scroll')
  // if no notifications to manipulate return
  if (!scrollContainer) return
  const maxHeight = window.innerHeight
  const brandingHeight = getById('bn-transaction-branding').clientHeight + 26
  const widgetHeight = scrollContainer.scrollHeight + brandingHeight

  const tooBig = widgetHeight > maxHeight

  if (tooBig) {
    setHeight(scrollContainer, 'scroll', maxHeight - brandingHeight)
    scrollContainer.scrollTop = maxHeight * 4
  } else {
    setHeight(scrollContainer, 'initial', 'auto')
  }

  const notificationsContainer = getById('blocknative-notifications')
  const toolTipBuffer = !tooBig ? 50 : 0

  resizeIframe({
    height: notificationsContainer.clientHeight + toolTipBuffer,
    width: 371,
    transitionHeight: true
  })
}

function setHeight(el, overflow, height) {
  el.style['overflow-y'] = overflow
  el.style.height = height
}
