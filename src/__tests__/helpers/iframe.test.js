import 'jest-dom/extend-expect'

import { createIframe } from '../../js/helpers/iframe'
import styles from '../../css/styles.css'

test('iframe gets rendered to document', () => {
  createIframe(window.document, styles)

  const iframe = document.querySelector('iframe')

  expect(iframe).toBeInTheDocument()
})
