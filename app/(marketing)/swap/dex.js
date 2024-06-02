import { dexFactory } from "@/ABIs/dexFactory"
import { ethers } from "ethers"

const dexFactoryAddress = "0xYourDEXFactoryContractAddress" // Replace with your deployed DEX factory contract address

export async function createPair(provider, tokenAddress) {
  const signer = provider.getSigner()
  const dexFactoryContract = new ethers.Contract(
    dexFactoryAddress,
    dexFactory,
    signer
  )

  try {
    const tx = await dexFactoryContract.createPair(tokenAddress)
    await tx.wait()
    console.log("Pair created successfully:", tx)
  } catch (error) {
    console.error("Pair creation failed:", error)
  }
}

export async function addLiquidity(
  provider,
  tokenAddress,
  tokenAmount,
  wFTMAmount
) {
  const signer = provider.getSigner()
  const dexFactoryContract = new ethers.Contract(
    dexFactoryAddress,
    dexFactory,
    signer
  )

  try {
    const tx = await dexFactoryContract.addLiquidity(
      tokenAddress,
      tokenAmount,
      {
        value: ethers.utils.parseEther(wFTMAmount.toString()),
      }
    )
    await tx.wait()
    console.log("Liquidity added successfully:", tx)
  } catch (error) {
    console.error("Adding liquidity failed:", error)
  }
}

export async function swapTokens(
  provider,
  tokenFrom,
  tokenTo,
  amountIn,
  minAmountOut
) {
  const signer = provider.getSigner()
  const dexFactoryContract = new ethers.Contract(
    dexFactoryAddress,
    dexFactory,
    signer
  )

  try {
    const tx = await dexFactoryContract.swap(
      tokenFrom,
      tokenTo,
      amountIn,
      minAmountOut
    )
    await tx.wait()
    console.log("Swap successful:", tx)
  } catch (error) {
    console.error("Swap failed:", error)
  }
}
