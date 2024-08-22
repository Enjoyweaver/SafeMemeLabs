import { ExchangeABI } from "@/ABIs/SafeLaunch/Exchange"
import { ethers } from "ethers"

export const getStageDetails = async (
  dexAddress: string,
  provider: ethers.providers.Provider
) => {
  if (dexAddress === ethers.constants.AddressZero) return null

  const dexContract = new ethers.Contract(dexAddress, ExchangeABI, provider)

  try {
    const stageDetails = await dexContract.getStageDetails()
    const safeLaunchActive = await dexContract.safeLaunchActive()

    const [
      stageStatuses,
      tokenBRequired,
      safeMemePrices,
      safeMemeRemaining,
      tokenBReceived,
      safeMemesSoldThisStage,
      soldsafeMemeThisTX,
      is_open,
      tokenBRequired_set,
      tokenBReceived_met,
      stage_completed,
    ] = stageDetails

    const tokenBAddress = await dexContract.tokenBAddress()
    const tokenBName = await dexContract.tokenBName()
    const tokenBSymbol = await dexContract.tokenBSymbol()
    const currentStage = await dexContract.currentStage()

    const currentStageIndex = currentStage.toNumber()

    const stageInfo = {
      currentStage: currentStageIndex,
      tokenBAddress,
      tokenBName,
      tokenBSymbol,
      stageTokenBAmount: ethers.utils.formatEther(
        tokenBRequired[currentStageIndex]
      ),
      safeMemePrices: ethers.utils.formatEther(
        safeMemePrices[currentStageIndex]
      ),
      safeMemeAvailable: ethers.utils.formatEther(
        safeMemeRemaining[currentStageIndex]
      ),
      tokenBReceived: ethers.utils.formatEther(
        tokenBReceived[currentStageIndex]
      ),
      safeMemesSold: ethers.utils.formatEther(
        safeMemesSoldThisStage[currentStageIndex]
      ),
      soldsafeMeme: ethers.utils.formatEther(
        soldsafeMemeThisTX[currentStageIndex]
      ),
      stageStatuses: stageStatuses[currentStageIndex].toNumber(),
      is_open: is_open[currentStageIndex],
      tokenBSet: tokenBRequired_set[currentStageIndex],
      tokenBReceived_met: tokenBReceived_met[currentStageIndex],
      stage_completed: stage_completed[currentStageIndex],
      safeLaunchActive,
      safeLaunchComplete: stage_completed[currentStageIndex],
    }

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
      ...stageInfo,
      pastTransactions,
    }
  } catch (error) {
    console.error("Error fetching DEX info:", error)
    return null
  }
}
