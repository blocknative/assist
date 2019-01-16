import bowser from 'bowser'
import { updateState } from './state'

// Get user agent info
export function getUserAgent() {
  const browser = bowser.getParser(window.navigator.userAgent)
  const userAgent = browser.parse().parsedResult

  updateState({
    userAgent,
    mobileDevice: userAgent.platform.type !== 'desktop'
  })
}

// Check if valid browser
export function checkValidBrowser() {
  const browser = bowser.getParser(window.navigator.userAgent)
  const validBrowser = browser.satisfies({
    desktop: {
      chrome: '>49',
      firefox: '>52',
      opera: '>36'
    }
  })
  updateState({ validBrowser })
}
