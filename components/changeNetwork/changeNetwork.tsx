import { FC } from "react"
import { useSwitchNetwork } from "wagmi"

import { Overlay } from "../overlay/overlay"
import styles from "./changeNetwork.module.css"

// Define the props interface for ChangeNetwork component
interface ChangeNetworkProps {
  changeNetworkToChainId: number
  dappName: string
  networks: string
}

export const ChangeNetwork: FC<ChangeNetworkProps> = ({
  changeNetworkToChainId,
  dappName,
  networks,
}) => {
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()

  return (
    <>
      <Overlay onClick={undefined} />
      <div className={styles.changeNetwork}>
        <p className={styles.changeNetworkHeader}>Unsupported Network!</p>
        <p>
          {dappName} only supports {networks}
        </p>
        <p
          className={styles.switchNetwork}
          onClick={() => switchNetwork?.(changeNetworkToChainId)}
        >
          Switch Network in Wallet
        </p>
        <p>{error && error.message}</p>
      </div>
    </>
  )
}
