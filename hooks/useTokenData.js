import { useEffect, useState } from "react"
import { erc20ABI } from "@/ABIs/erc20"
import { useContractReads } from "wagmi"

const useTokenData = (contractRequests) => {
  const [tokenData, setTokenData] = useState([])

  useEffect(() => {
    if (contractRequests.length > 0) {
      fetchTokenData(contractRequests)
    }
  }, [contractRequests])

  const fetchTokenData = async (contractRequests) => {
    try {
      const result = await useContractReads({
        contracts: contractRequests,
        enabled: true,
      })
      setTokenData(splitData(result.data || []))
    } catch (error) {
      console.error("Token Data Error: ", error)
      setTokenData([])
    }
  }

  const splitData = (data) => {
    const groupedData = []
    const namedData = []
    for (let i = 0; i < data.length; i += 5) {
      groupedData.push(data.slice(i, i + 5))
    }
    for (let i = 0; groupedData.length; i++) {
      namedData.push({
        name: groupedData[i][0].result,
        symbol: groupedData[i][1].result,
        supply: groupedData[i][2].result,
        decimals: groupedData[i][3].result,
        antiWhalePercentage: groupedData[i][4].result,
      })
    }
    return namedData.reverse()
  }

  return tokenData
}

export default useTokenData
