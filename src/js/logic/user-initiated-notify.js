import uuid from 'uuid/v4'
import { handleEvent } from '~/js/helpers/events'
import { getAllByQuery, removeNotification } from '~/js/views/dom'

const defaultTimeout = eventCode => {
  if (eventCode === 'success') return 2000
  if (eventCode === 'pending') return 5000
  if (eventCode === 'error') return 5000
  throw new Error('Invalid eventCode')
}

/* Allow the developer to spawn custom notifications
 * Returns a function that when called will dismiss the notification
 * - customTimeout:
 *     Overrides default timeout length. Set to -1 for no timeout.
 * - returns:
 *     A function that when called will dismiss the notification
 */
export default function userInitiatedNotify(
  eventCode,
  message,
  { customTimeout = defaultTimeout(eventCode) }
) {
  // Validate message
  if (typeof message !== 'string') throw new Error('Message is required')
  // Validate eventCode
  if (
    eventCode !== 'success' &&
    eventCode !== 'pending' &&
    eventCode !== 'error'
  )
    throw new Error(`eventCode must be one of: ['success', 'pending', 'error']`)
  // Validate customTimeout
  if (customTimeout && typeof customTimeout !== 'number')
    throw new Error('customTimeout must be a number')

  const id = uuid()
  handleEvent({
    eventCode,
    categoryCode: 'userInitiatedNotify',
    transaction: { id, startTime: Date.now() },
    inlineCustomMsgs: { [eventCode]: () => message },
    customTimeout: customTimeout !== -1 && customTimeout
  })

  // Return a callback the user can use to dismiss the notification
  const notification = getAllByQuery(`.bn-${id}`)[0]
  return () => {
    removeNotification(notification)
  }
}
