import 'jest-dom/extend-expect'

import { createIframe } from '~/js/helpers/iframe'
import styles from '~/css/styles.css'
import { updateState } from '~/js/helpers/state'

test('iframe gets rendered to document', () => {
  updateState({ config: {} })
  createIframe(window.document, styles)

  const iframe = document.querySelector('iframe')

  expect(iframe).toBeInTheDocument()
})
