import { NextApiRequest, NextApiResponse } from "next"
import { ethers } from "ethers"

const provider = new ethers.providers.JsonRpcProvider(process.env.BASE_RPC_URL)
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider)
const contractAddress = process.env.CONTRACT_ADDRESS
const abi = [
  // ABI of your BaseNFTMinter contract
  "function mintNFT(address recipient, string memory tokenURI) public returns (uint256)",
]
const contract = new ethers.Contract(contractAddress, abi, wallet)

const images = [
  "Hank.jpg",
  "Adele.jpg",
  "Clark Fable.jpg",
  "Cliff.jpg",
  "Destiny.jpg",
  "Dole.jpg",
  "Duck Warhol.jpg",
  "John.jpg",
  "Josephine.jpg",
  "Miss Grace.jpg",
  "Miss Tonya.jpg",
  "Weatherby.jpg",
  "Virgil.jpg",
  "Swirly.jpg",
  "Straw.jpg",
]

let currentIndex = 0

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  currentIndex = (currentIndex - 1 + images.length) % images.length
  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`

  try {
    const tx = await contract.mintNFT(req.body.recipient, imageUrl)
    await tx.wait()
    res.status(200).json({ imageUrl })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
