// eslint-disable-next-line import/no-extraneous-dependencies
import MockDate from 'mockdate'
import { port as ganachePort } from './ganacheConfig'

// Mock Date.now()
MockDate.set('1/1/2010')

// Set a single userAgent to use across all development environments
Object.defineProperty(window.navigator, 'userAgent', {
  value:
    'Mozilla/ 5.0(linux) AppleWebKit / 537.36(KHTML, like Gecko) jsdom / 11.12.0'
})

// Seemingly unavoidable uncaught rejections coming from the web3
// websocket provider we setup to deploy the smart contracts, ignore them
process.on('unhandledRejection', (reason, p) => {
  if (
    reason.target &&
    reason.target.constructor &&
    reason.target.constructor.name === 'W3CWebSocket' &&
    reason.target.url === `ws://localhost:${ganachePort}` &&
    reason.type === 'error'
    // eslint-disable-next-line no-empty
  ) {
  } else {
    // eslint-disable-next-line no-console
    console.log('Unhandled Rejection at: ', p, 'reason:', reason)
  }
})
