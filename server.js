const express = require("express")
const { exec } = require("child_process")

const app = express()
const port = 3000

app.use(express.json())

app.post("/deploy", (req, res) => {
  const {
    admin,
    name,
    symbol,
    contractURI,
    trustedForwarders,
    saleRecipient,
    platformFeeRecipient,
    platformFeeBps,
  } = req.body

  // Run the deployment script
  exec(
    `npx hardhat run scripts/deploy.js --network ropsten`,
    (err, stdout, stderr) => {
      if (err) {
        console.error(`exec error: ${err}`)
        return res.status(500).send("Deployment failed")
      }
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
      res.send("Deployment successful: " + stdout)
    }
  )
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`)
})
