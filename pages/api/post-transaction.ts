import fs from "fs"
import path from "path"
import { NextApiRequest, NextApiResponse } from "next"
import Arweave from "arweave"

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const unsignedTx = req.body

      // Load the server wallet JWK file securely
      const walletJwk = JSON.parse(
        fs.readFileSync(path.join(process.cwd(), "server-wallet.json"), "utf-8")
      )

      const arweave = Arweave.init({})

      // Reconstruct the transaction
      const transaction = await arweave.transactions.fromRaw(unsignedTx)

      // Sign the transaction
      await arweave.transactions.sign(transaction, walletJwk)

      // Post the transaction
      const response = await arweave.transactions.post(transaction)

      res.status(200).json({ status: response.status, txId: transaction.id })
    } catch (error) {
      console.error("Error in /api/post-transaction:", error)
      res.status(500).json({ error: "Failed to post transaction." })
    }
  } else {
    res.status(405).json({ error: "Method not allowed." })
  }
}
