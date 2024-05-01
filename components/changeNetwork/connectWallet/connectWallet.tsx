import Image from "next/image"
import { useIsMounted } from "usehooks-ts"
import { useConnect } from "wagmi"

import styles from "./connectWallet.module.css"

export function ConnectWallet() {
  const isMounted = useIsMounted()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  return (
    <div className={styles.connectionOptions}>
      <p className={styles.connectionHeading}>Connect Wallet</p>
      <p className={styles.connectionDesc}>
        Interact with SafeMeme Labs by connecting a Web3 Wallet
      </p>
      {connectors.map((connector) => (
        <button
          disabled={isMounted() ? !connector.ready : false}
          key={connector.id}
          onClick={() => connect({ connector })}
          className={`${styles.connectionOption} ${
            !connector.ready && isMounted() && styles.uninstalled
          }`}
        >
          {String(connector.name) === "MetaMask" && (
            <Image
              src="/assets/icons/metamask.png"
              alt="logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}
          {String(connector.name) === "Coinbase Wallet" && (
            <Image
              src="/assets/icons/coinbase.png"
              alt="logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}
          {String(connector.name) === "WalletConnect" && (
            <Image
              src="/assets/icons/walletConnect.png"
              alt="logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}
          {String(connector.name) === "Injected" && (
            <Image
              src="/assets/icons/wallet.svg"
              alt="logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}
          <p className={styles.connector}>{connector.name}</p>
          {!connector.ready && isMounted() && (
            <p className={styles.connector}>&emsp;(uninstalled)</p>
          )}
          {isLoading && connector.id === pendingConnector?.id && (
            <p className={styles.connector}>&emsp;(connecting)</p>
          )}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  )
}
