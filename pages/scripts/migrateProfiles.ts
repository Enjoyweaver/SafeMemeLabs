// scripts/migrateProfiles.ts

import Arweave from "arweave"
import Account, { ArAccount } from "arweave-account"

const migrateProfiles = async () => {
  const arweave = Arweave.init({
    host: "arweave.net",
    port: 443,
    protocol: "https",
  })
  const account = new Account(arweave)

  // Replace with your logic to retrieve all profiles
  const allProfiles: ArAccount[] = await account.getAllAccounts()

  for (const user of allProfiles) {
    if (user.profile && !user.profile.handleName) {
      // Assuming profiles missing handleName are inconsistent
      const updatedProfile = { profile: user.profile }

      try {
        const tx = await arweave.createTransaction({
          data: JSON.stringify(updatedProfile),
        })
        tx.addTag("App-Name", "SafeMemes.fun")

        // Dispatch the transaction (requires Arweave Web Wallet)
        const result = await window.arweaveWallet.dispatch(tx)
        if (result && result.id) {
          console.log(`Successfully migrated profile for ${user.addr}`)
        } else {
          console.error(`Failed to migrate profile for ${user.addr}`)
        }
      } catch (error) {
        console.error(`Error migrating profile for ${user.addr}:`, error)
      }
    }
  }
}

migrateProfiles()
