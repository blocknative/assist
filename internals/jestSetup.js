// eslint-disable-next-line import/no-extraneous-dependencies
import MockDate from 'mockdate'

// Mock Date.now()
MockDate.set('1/1/2010')

// Set a single userAgent to use across all development environments
Object.defineProperty(window.navigator, 'userAgent', {
  value:
    'Mozilla/ 5.0(linux) AppleWebKit / 537.36(KHTML, like Gecko) jsdom / 11.12.0'
})
