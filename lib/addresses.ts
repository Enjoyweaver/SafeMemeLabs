// lib/addresses.ts
import { FrameButtonMetadata } from "@coinbase/onchainkit"

export function getAddresses(interactor: {
  fid: number
  custody_address: string
  verified_accounts: string[]
}) {
  let addresses = []

  if (interactor.verified_accounts) {
    interactor.verified_accounts.forEach((account) => {
      addresses.push(account)
    })
  }

  if (
    addresses.length === 0 &&
    interactor.custody_address &&
    interactor.custody_address !== "0x"
  ) {
    addresses.push(interactor.custody_address)
  }
  return addresses
}

export function getAddressButtons(interactor: {
  fid: number
  custody_address: string
  verified_accounts: string[]
}) {
  let buttons = []

  if (interactor.verified_accounts) {
    interactor.verified_accounts.forEach((account) => {
      buttons.push({
        label: `🟢 ${account.slice(0, 6)}`,
      })
    })
  }

  if (
    buttons.length === 0 &&
    interactor.custody_address &&
    interactor.custody_address !== "0x"
  ) {
    buttons.push({
      label: `🟣 ${interactor.custody_address.slice(0, 6)}`,
    })
  }
  return buttons as [FrameButtonMetadata, ...FrameButtonMetadata[]]
}
