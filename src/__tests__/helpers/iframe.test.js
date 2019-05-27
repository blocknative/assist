import 'jest-dom/extend-expect'

import assist from '~/js'
import { createIframe } from '~/js/helpers/iframe'
import styles from '~/css/styles.css'
import { updateState, initialState } from '~/js/helpers/state'
import { handleEvent } from '~/js/helpers/events'

test('iframe gets rendered to document', () => {
  createIframe(window.document, styles)

  const iframe = document.querySelector('iframe')

  expect(iframe).toBeInTheDocument()
})

// Check that updating notificationsPosition doesn't throw any errors
describe('when the initial notification position is bottomRight', () => {
  let notificationsPosition
  let config
  beforeEach(() => {
    notificationsPosition = 'bottomRight'
    config = { dappId: '123', style: { notificationsPosition } }
  })
  describe('and there are no notifications in the DOM', () => {
    test(`changing the notification position to topLeft doesn't throw`, () => {
      const da = assist.init(config)
      da.updateStyle({ notificationsPosition: 'topLeft' })
    })
    test(`changing the notification position to {desktop: 'topLeft'} doesn't throw`, () => {
      const da = assist.init(config)
      da.updateStyle({ notificationsPosition: { desktop: 'topLeft' } })
    })
  })
  describe('and there are notifications in the DOM', () => {
    test(`changing the notification position to topLeft doesn't throw`, () => {
      const da = assist.init(config)
      handleEvent({ eventCode: 'txPending', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txSent', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txFailed', categoryCode: 'activeTransaction' })
      da.updateStyle({ notificationsPosition: 'topLeft' })
    })
    test(`changing the notification position to {desktop: 'topLeft'} doesn't throw`, () => {
      const da = assist.init(config)
      handleEvent({ eventCode: 'txPending', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txSent', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txFailed', categoryCode: 'activeTransaction' })
      da.updateStyle({ notificationsPosition: { desktop: 'topLeft' } })
    })
  })
})

describe(`when the initial notification position is {desktop: 'bottomRight'}`, () => {
  let notificationsPosition
  let config
  beforeEach(() => {
    notificationsPosition = { desktop: 'bottomRight' }
    config = { dappId: '123', style: { notificationsPosition } }
  })
  describe('and there are no notifications in the DOM', () => {
    test(`changing the notification position to topLeft doesn't throw`, () => {
      const da = assist.init(config)
      da.updateStyle({ notificationsPosition: 'topLeft' })
    })
    test(`changing the notification position to {desktop: 'topLeft'} doesn't throw`, () => {
      const da = assist.init(config)
      da.updateStyle({ notificationsPosition: { desktop: 'topLeft' } })
    })
  })
  describe('and there are notifications in the DOM', () => {
    test(`changing the notification position to topLeft doesn't throw`, () => {
      const da = assist.init(config)
      handleEvent({ eventCode: 'txPending', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txSent', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txFailed', categoryCode: 'activeTransaction' })
      da.updateStyle({ notificationsPosition: 'topLeft' })
    })
    test(`changing the notification position to {desktop: 'topLeft'} doesn't throw`, () => {
      const da = assist.init(config)
      handleEvent({ eventCode: 'txPending', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txSent', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txFailed', categoryCode: 'activeTransaction' })
      da.updateStyle({ notificationsPosition: { desktop: 'topLeft' } })
    })
  })
})

describe('when the initial notification position is topLeft', () => {
  let notificationsPosition
  let config
  beforeEach(() => {
    notificationsPosition = 'topLeft'
    config = { dappId: '123', style: { notificationsPosition } }
  })
  describe('and there are no notifications in the DOM', () => {
    test(`changing the notification position to bottomRight doesn't throw`, () => {
      const da = assist.init(config)
      da.updateStyle({ notificationsPosition: 'bottomRight' })
    })
  })
  describe('and there are notifications in the DOM', () => {
    test(`changing the notification position to bottomRight doesn't throw`, () => {
      const da = assist.init(config)
      handleEvent({ eventCode: 'txPending', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txSent', categoryCode: 'activeTransaction' })
      handleEvent({ eventCode: 'txFailed', categoryCode: 'activeTransaction' })
      da.updateStyle({ notificationsPosition: 'bottomRight' })
    })
  })
})

afterEach(() => {
  updateState(initialState)
})
