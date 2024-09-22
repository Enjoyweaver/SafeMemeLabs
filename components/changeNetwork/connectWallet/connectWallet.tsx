import { useEffect, useState } from "react"
import Image from "next/image"
import { ArweaveWebWallet } from "arweave-wallet-connector"
import { useIsMounted } from "usehooks-ts"
import { useAccount, useConnect } from "wagmi"

import styles from "./connectWallet.module.css"

export function ConnectWallet() {
  const isMounted = useIsMounted()
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()
  const { address, isConnected: isWeb3Connected } = useAccount()

  const [arweaveWallet, setArweaveWallet] = useState(null)
  const [isArweaveConnected, setIsArweaveConnected] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)

  useEffect(() => {
    const wallet = new ArweaveWebWallet({
      name: "SafeMeme Labs",
      logo: "https://jfbeats.github.io/ArweaveWalletConnector/placeholder.svg",
    })
    wallet.setUrl("arweave.app")
    setArweaveWallet(wallet)

    // Check if a Web3 wallet is already connected
    if (isWeb3Connected) {
      setConnectedWallet("Web3")
    }
  }, [isWeb3Connected])

  const connectToArweave = async () => {
    try {
      if (arweaveWallet) {
        await arweaveWallet.connect()
        setIsArweaveConnected(true)
        setConnectedWallet("Arweave")
        console.log("Connected to Arweave wallet")
      }
    } catch (error) {
      console.error("Failed to connect to Arweave:", error)
    }
  }

  useEffect(() => {
    if (isWeb3Connected) {
      setConnectedWallet("Web3")
    } else if (isArweaveConnected) {
      setConnectedWallet("Arweave")
    } else {
      setConnectedWallet(null)
    }
  }, [isWeb3Connected, isArweaveConnected])

  if (connectedWallet) {
    return null // Hide the connect button when any wallet is connected
  }

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
          onClick={() => {
            connect({ connector })
            setConnectedWallet(connector.name)
          }}
          className={`${styles.connectionOption} ${
            !connector.ready && isMounted() && styles.uninstalled
          } ${
            isWeb3Connected && connectedWallet === connector.name
              ? styles.connected
              : ""
          }`}
        >
          {connector.name === "MetaMask" && (
            <Image
              src="/assets/icons/metamask.png"
              alt="MetaMask Logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}

          {connector.name === "WalletConnect" && (
            <Image
              src="/assets/icons/walletConnect.png"
              alt="WalletConnect Logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}

          {connector.name === "Rabby" && (
            <Image
              src="/assets/icons/rabby.png"
              alt="Rabby Wallet Logo"
              width={30}
              height={30}
              className={styles.walletLogo}
            />
          )}

          {connector.name === "Injected" && (
            <Image
              src="/assets/icons/wallet.svg"
              alt="Injected Wallet Logo"
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

      <button
        onClick={connectToArweave}
        className={`${styles.connectionOption} ${
          isArweaveConnected || connectedWallet === "Arweave"
            ? styles.connected
            : ""
        }`}
      >
        <Image
          src="/assets/icons/arweave.png"
          alt="Arweave Wallet Logo"
          width={30}
          height={30}
          className={styles.walletLogo}
        />
        <p className={styles.connector}>Arweave</p>
        {isArweaveConnected && (
          <p className={styles.connector}>&emsp;(connected)</p>
        )}
      </button>
    </div>
  )
}
