/* eslint-disable import/prefer-default-export */
import ow from 'ow'
import { assistLog } from './utilities'

const desktopPosition = ow.optional.string.is(
  s =>
    s === 'bottomLeft' ||
    s === 'bottomRight' ||
    s === 'topRight' ||
    s === 'topLeft'
)

const mobilePosition = ow.optional.string.is(s => s === 'bottom' || s === 'top')

export function validateConfig(config) {
  try {
    ow(
      config,
      'config',
      ow.object.exactShape({
        networkId: ow.number,
        dappId: ow.string,
        web3: ow.optional.object,
        ethers: ow.optional.object,
        mobileBlocked: ow.optional.boolean,
        minimumBalance: ow.optional.string,
        headlessMode: ow.optional.boolean,
        messages: ow.optional.object.exactShape({
          txRequest: ow.optional.function,
          txSent: ow.optional.function,
          txPending: ow.optional.function,
          txSendFail: ow.optional.function,
          txStallPending: ow.optional.function,
          txStallConfirmed: ow.optional.function,
          txFailed: ow.optional.function,
          txDropped: ow.optional.function,
          nsfFail: ow.optional.function,
          txRepeat: ow.optional.function,
          txAwaitingApproval: ow.optional.function,
          txConfirmReminder: ow.optional.function,
          txConfirmed: ow.optional.function,
          txSpeedUp: ow.optional.function
        }),
        handleNotificationEvent: ow.optional.function,
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
        timeouts: ow.optional.object.exactShape({
          txStallPending: ow.optional.number,
          txStallConfirmed: ow.optional.number
        }),
        recommendedWallets: ow.optional.object.exactShape({
          desktop: ow.optional.array.ofType(
            ow.object.exactShape({
              name: ow.string,
              link: ow.string,
              icon: ow.string
            })
          ).nonEmpty,
          mobile: ow.optional.array.ofType(
            ow.object.exactShape({
              name: ow.string,
              link: ow.string,
              icon: ow.string
            })
          ).nonEmpty
        })
      })
    )
  } catch (error) {
    if (error.message.includes('Did not expect property `txStall` to exist')) {
      assistLog(
        'txStall events have now been separated in to txStallPending and txStallConfirmed events. Use the new eventCodes for custom messages on those events '
      )
    } else {
      throw error
    }
  }
}
