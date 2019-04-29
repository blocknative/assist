import * as events from 'js/helpers/events'
import * as websocket from 'js/helpers/websockets'
import * as state from 'js/helpers/state'
import * as transactionQueue from 'js/helpers/transaction-queue'

transactionQueue.getTxObjFromQueue = jest.fn(() => ({
  transaction: { status: 'pending' }
}))

test('Will not handle socket messages without a correct API key', () => {
  events.handleEvent = jest.fn()
  state.updateState = jest.fn()

  const socketMessage = {
    data: JSON.stringify({
      status: 'error',
      reason: 'not a valid API key',
      event: {
        transaction: {
          status: 'pending'
        }
      }
    })
  }
  try {
    websocket.handleSocketMessage(socketMessage)
  } catch (err) {
    expect(state.updateState).toBeCalledWith({
      validApiKey: false
    })

    expect(events.handleEvent).toBeCalledWith({
      eventCode: 'initFail',
      categoryCode: 'initialize',
      reason: 'not a valid API key'
    })
  }
})

test('Will handle socket messages if we have a correct API key', () => {
  events.handleEvent = jest.fn()
  state.updateState = jest.fn()

  const socketMessage = {
    data: JSON.stringify({
      status: 'ok',
      userAgent: '1',
      event: {
        eventCode: 'checkDappId'
      }
    })
  }
  websocket.handleSocketMessage(socketMessage)
  expect(state.updateState).toBeCalledWith({
    validApiKey: true,
    supportedNetwork: true
  })
  // Should be called once more to handle the event
  expect(events.handleEvent).toBeCalledTimes(1)
})
