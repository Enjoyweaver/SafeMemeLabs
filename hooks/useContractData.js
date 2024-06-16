import { useEffect, useState } from "react"
import { tokenDeployerABI } from "@/ABIs/tokenDeployer"
import { tokenLauncherABI } from "@/ABIs/tokenLauncher"
import { tokenDeployerDetails, tokenLauncherDetails } from "@/Constants/config"
import { useContractRead } from "wagmi"

const useContractData = (walletAddress) => {
  const [deployerContracts, setDeployerContracts] = useState([])
  const [launcherContracts, setLauncherContracts] = useState([])

  useEffect(() => {
    if (walletAddress) {
      fetchAllContracts(walletAddress)
    }
  }, [walletAddress])

  const fetchAllContracts = async (walletAddress) => {
    let allDeployerContracts = []
    let allLauncherContracts = []
    for (const chainId in tokenDeployerDetails) {
      const deployerResult = await fetchContractRead({
        address: tokenDeployerDetails[chainId],
        abi: tokenDeployerABI,
        functionName: "getTokensDeployedByUser",
        args: [walletAddress],
      })
      allDeployerContracts = allDeployerContracts.concat(deployerResult)

      const launcherResult = await fetchContractRead({
        address: tokenLauncherDetails[chainId],
        abi: tokenLauncherABI,
        functionName: "getTokensDeployedByUser",
        args: [walletAddress],
      })
      allLauncherContracts = allLauncherContracts.concat(launcherResult)
    }
    setDeployerContracts(allDeployerContracts)
    setLauncherContracts(allLauncherContracts)
  }

  const fetchContractRead = async ({ address, abi, functionName, args }) => {
    try {
      const result = await useContractRead({ address, abi, functionName, args })
      return result.data || []
    } catch (error) {
      console.error("Contract Read Error: ", error)
      return []
    }
  }

  return { deployerContracts, launcherContracts }
}

export default useContractData
