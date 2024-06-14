const express = require("express")
const bodyParser = require("body-parser")
const cors = require("cors")
const { ethers } = require("ethers")
require("dotenv").config()
const fs = require("fs")
const path = require("path")

const app = express()
const port = 3001

app.use(cors())
app.use(bodyParser.json())

app.post("/deploy", async (req, res) => {
  const {
    name,
    symbol,
    contractURI,
    trustedForwarders,
    saleRecipient,
    platformFeeRecipient,
    platformFeeBps,
    maxTotalSupply,
  } = req.body

  console.log("Deploy request received with data:", req.body) // Log the incoming request data

  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.JSON_RPC_PROVIDER_URL
    )
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)

    const contractArtifact = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "artifacts/contracts/Claim.sol/Claim.json"),
        "utf8"
      )
    )
    const factory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      wallet
    )

    console.log("Deploying with the following parameters:")
    console.log("Name:", name)
    console.log("Symbol:", symbol)
    console.log("Contract URI:", contractURI)
    console.log("Trusted Forwarders:", trustedForwarders)
    console.log("Sale Recipient:", saleRecipient)
    console.log("Platform Fee Recipient:", platformFeeRecipient)
    console.log("Platform Fee Bps:", platformFeeBps)
    console.log("Max Total Supply:", maxTotalSupply)

    const contract = await factory.deploy(
      name,
      symbol,
      contractURI || [], // Default to an empty array if undefined
      trustedForwarders || [], // Default to an empty array if undefined
      saleRecipient,
      platformFeeRecipient,
      platformFeeBps,
      maxTotalSupply
    )

    await contract.deployed()

    res.json({ contractAddress: contract.address })
  } catch (error) {
    console.error("Error during deployment:", error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`)
})
