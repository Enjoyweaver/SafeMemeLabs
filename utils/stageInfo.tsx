import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ethers } from "ethers"

export const getStageInfo = async (
  dexAddress: string,
  provider: ethers.providers.Provider
) => {
  if (dexAddress === ethers.constants.AddressZero) return null

  const dexContract = new ethers.Contract(dexAddress, ExchangeABI, provider)

  try {
    const currentStageInfo = await dexContract.getCurrentStageInfo()
    const [
      currentStage,
      stageStatus,
      tokenBRequired,
      safeMemePrice,
      safeMemeAvailable,
      tokenBReceived,
      safeMemesSold,
      soldsafeMeme,
      tokenBSet,
      safeLaunchComplete,
    ] = currentStageInfo

    const tokenBAddress = await dexContract.tokenBAddress()
    const tokenBName = await dexContract.tokenBName()
    const tokenBSymbol = await dexContract.tokenBSymbol()

    const [
      stagetokenBReceived,
      stageSafeMemesSold,
      safeMeme_remaining,
      currentStageFromLiquidity,
    ] = await dexContract.getStageLiquidity(currentStage.toNumber())

    const filter = dexContract.filters.SafeMemePurchased()
    const events = await dexContract.queryFilter(filter)

    const pastTransactions = events.map((event) => ({
      buyer: event.args.buyer,
      safeMeme: event.args.safeMeme,
      safeMemeAmount: ethers.utils.formatEther(event.args.safeMemeAmount),
      tokenBAmount: ethers.utils.formatEther(event.args.tokenBAmount),
      stage: event.args.stage.toNumber(),
    }))

    return {
      address: dexAddress,
      currentStage: currentStage.toNumber(),
      tokenBAddress,
      tokenBName,
      tokenBSymbol,
      stageTokenBAmount: ethers.utils.formatEther(tokenBRequired),
      safeMemePrices: ethers.utils.formatEther(safeMemePrice),
      safeMemeAvailable: ethers.utils.formatEther(safeMemeAvailable),
      tokenBReceived: ethers.utils.formatEther(tokenBReceived),
      safeMemesSold: ethers.utils.formatEther(safeMemesSold),
      stageSafeMemesSold: ethers.utils.formatEther(stageSafeMemesSold),
      safeMeme_remaining: ethers.utils.formatEther(safeMeme_remaining),
      soldsafeMeme: ethers.utils.formatEther(soldsafeMeme),
      safeLaunchActivated: tokenBSet,
      tokenBSet,
      stageAmountSet: stageStatus.toNumber() === 2,
      safeLaunchComplete,
      pastTransactions,
    }
  } catch (error) {
    console.error("Error fetching DEX info:", error)
    return null
  }
}
