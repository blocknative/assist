import uuid from 'uuid/v4'
import { handleEvent } from '../helpers/events'
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
export default function notify(eventCode, message, options) {
  const id = uuid()
  const { customTimeout } = options
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
