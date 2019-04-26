import uuid from 'uuid/v4'
import { handleEvent } from '../helpers/events'
import { state } from '../helpers/state'
import { getAllByQuery, removeNotification } from '../views/dom'

const defaultTimeout = eventCode => {
  if (eventCode === 'success') return 2000
  if (eventCode === 'pending') return 5000
  if (eventCode === 'error') return 5000
  throw new Error('Invalid eventCode')
}

/* Allow the user to create custom notifications
 * Returns a function that when called will dismiss the notification
 * - customTimeout:
 *     Overrides default timeout length. Set to -1 for no timeout.
 * - returns:
 *     A function that when called will dismiss the notification
 */
export default function userInitiatedNotify(eventCode, message, options) {
  // Enforce assist must be initialized
  if (!state.iframe)
    throw new Error('assist must be initialized before calling notify')

  // Validate message
  if (!message || typeof message !== 'string')
    throw new Error('Message is required')
  // Validate eventCode
  if (
    eventCode !== 'success' &&
    eventCode !== 'pending' &&
    eventCode !== 'error'
  )
    throw new Error(`eventCode must be one of: ['success', 'pending', 'error']`)
  const { customTimeout } = options
  // Validate customTimeout
  if (typeof customTimeout !== 'number')
    throw new Error('customTimeout must be a number')

  const id = uuid()
  handleEvent({
    eventCode,
    categoryCode: 'userInitiatedNotify',
    transaction: { id },
    inlineCustomMsgs: { [eventCode]: () => message },
    customTimeout:
      customTimeout !== -1 && (customTimeout || defaultTimeout(eventCode))
  })

  // Return a callback the user can use to dismiss the notification
  const notification = getAllByQuery(`.bn-${id}`)[0]
  return () => {
    removeNotification(notification)
  }
}
