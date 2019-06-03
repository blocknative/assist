/* eslint-disable import/prefer-default-export */
import ow from 'ow'

const desktopPosition = ow.optional.string.is(
  s =>
    s === 'bottomLeft' ||
    s === 'bottomRight' ||
    s === 'topRight' ||
    s === 'topLeft'
)

const mobilePosition = ow.optional.string.is(s => s === 'bottom' || s === 'top')

export function validateConfig(config) {
  ow(
    config,
    'config',
    ow.object.exactShape({
      networkId: ow.number,
      dappId: ow.string,
      web3: ow.optional.object,
      mobileBlocked: ow.optional.boolean,
      minimumBalance: ow.optional.number,
      headlessMode: ow.optional.boolean,
      messages: ow.optional.object.exactShape({
        txRequest: ow.optional.function,
        txSent: ow.optional.function,
        txPending: ow.optional.function,
        txSendFail: ow.optional.function,
        txStall: ow.optional.function,
        txFailed: ow.optional.function,
        nsfFail: ow.optional.function,
        txRepeat: ow.optional.function,
        txAwaitingApproval: ow.optional.function,
        txConfirmReminder: ow.optional.function,
        txConfirmed: ow.optional.function,
        txSpeedUp: ow.optional.function
      }),
      images: ow.optional.object.exactShape({
        welcome: ow.optional.object.exactShape({
          src: ow.string,
          srcset: ow.string
        }),
        complete: ow.optional.object.exactShape({
          src: ow.string,
          srcset: ow.string
        })
      }),
      style: ow.optional.object.exactShape({
        darkMode: ow.optional.boolean,
        notificationsPosition: ow.any(
          desktopPosition,
          ow.optional.object.exactShape({
            mobile: mobilePosition,
            desktop: desktopPosition
          })
        ),
        css: ow.optional.string
      }),
      truffleContract: ow.optional.boolean
    })
  )
}
