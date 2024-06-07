"use client"

import { FC, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { minidenticon } from "minidenticons"
import { useAccount, useDisconnect, useSwitchNetwork } from "wagmi"

import { ConnectWallet } from "../changeNetwork/connectWallet/connectWallet"
import { MobileNav } from "../mobileNav/navbar"
import { Overlay } from "../overlay/overlay"
import styles from "./walletconnect.module.css"

// Define the props for the MinidenticonImg component
interface MinidenticonImgProps {
  username: string
  saturation: number
  lightness: number
  [key: string]: any
}

// MinidenticonImg component generates a unique identicon based on the username
const MinidenticonImg: FC<MinidenticonImgProps> = ({
  username,
  saturation,
  lightness,
  ...props
}) => {
  const svgURI = useMemo(
    () =>
      "data:image/svg+xml;utf8," +
      encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness]
  )

  return <Image src={svgURI} alt={username} {...props} />
}

export default MinidenticonImg

const menuItems = []

// Define details of blockchain networks
const chainDetails = [
  {
    name: "Avalanche",
    chainId: 43114,
    logo: "/assets/icons/logos/avalanche.png",
  },
  { name: "Base", chainId: 8453, logo: "/assets/icons/logos/base.png" },
  { name: "Degen", chainId: 666666666, logo: "/assets/icons/logos/degen.png" },
  { name: "Fantom", chainId: 250, logo: "/assets/icons/logos/fantom.png" },
  {
    name: "Fantom Testnet",
    chainId: 4002,
    logo: "/assets/icons/logos/fantom.png",
  },
  { name: "Rootstock", chainId: 30, logo: "/assets/icons/logos/rootstock.png" },
  {
    name: "Rootstock Testnet",
    chainId: 31,
    logo: "/assets/icons/logos/rootstock.png",
  },
  // { name: "Stellar", chainId: 161, logo: "/assets/icons/logos/stellar.png" },
  // { name: "Polkadot", chainId: 0, logo: "/assets/icons/logos/polkadot.png" },
  // { name: "Stacks", chainId: 576, logo: "/assets/icons/logos/stacks.png" },
]

export function Navbar() {
  const [connectOpen, setConnectOpen] = useState<boolean>(false)
  const [connectMenuOpen, setConnectMenuOpen] = useState<boolean>(false)
  const [networkMenuOpen, setNetworkMenuOpen] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [tempNetwork, setTempNetwork] = useState<string>("Not Connected")
  const [menusOpen, setMenusOpen] = useState<boolean[]>([false, false])
  const dropdownRef = useRef<HTMLDivElement>(null) // Create a ref for the dropdown menu
  const [activeChainId, setActiveChainId] = useState(null)
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { switchNetwork } = useSwitchNetwork()

  // Toggle the visibility of the connect wallet overlay
  const toggleConnectOpen = () => {
    setConnectOpen(!connectOpen)
  }

  // Toggle the connect menu dropdown
  const toggleConnectMenuOpen = () => {
    if (!connectMenuOpen) {
      setNetworkMenuOpen(false)
      setMenusOpen([])
    }
    setConnectMenuOpen(!connectMenuOpen)
  }

  // Toggle the network menu dropdown
  const toggleNetworkMenuOpen = () => {
    if (!networkMenuOpen) {
      setConnectMenuOpen(false)
      setMenusOpen([])
    }
    setNetworkMenuOpen(!networkMenuOpen)
  }

  // Toggle individual menus
  const toggleMenu = (index: number) => {
    const updatedMenusOpen = [...menusOpen]
    updatedMenusOpen[index] = !updatedMenusOpen[index]
    setMenusOpen(updatedMenusOpen)
  }

  // Perform an action and close all dropdowns
  function dropdownAction(func: () => void): void {
    func()
    setMenusOpen([])
    setConnectMenuOpen(false)
    setNetworkMenuOpen(false)
  }

  // Add event listener to close dropdowns when clicking outside
  useEffect(() => {
    setIsClient(true)
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle clicks outside the dropdown to close it
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setMenusOpen([])
      setConnectMenuOpen(false)
      setNetworkMenuOpen(false)
    }
  }

  // Log current state for debugging
  useEffect(() => {
    console.log("isClient:", isClient)
    console.log("isConnected:", isConnected)
  }, [isClient, isConnected])

  return (
    <nav className={`${styles.nav} ${styles.container}`}>
      {!isConnected && connectOpen && <Overlay onClick={toggleConnectOpen} />}
      {!isConnected && connectOpen && <ConnectWallet />}
      <div className={styles.toShow}>
        <MobileNav />
      </div>
      <div className={styles.navbar}>
        <div className={styles.networkOptionsContainer}>
          <div className={styles.networkOptions}>
            {chainDetails.map((chain, index) => (
              <button
                key={chain.chainId}
                className={`${styles.networkOption} ${
                  chain.chainId === activeChainId ? styles.active : ""
                }`}
                onClick={() => {
                  dropdownAction(() => switchNetwork?.(chain.chainId))
                  setActiveChainId(chain.chainId) // Update active chain ID on click
                }}
              >
                <Image
                  src={chain.logo}
                  alt={chain.name}
                  className={styles.chainLogo}
                  height={20}
                  width={20}
                />
                <span className={styles.chainName}>{chain.name}</span>
              </button>
            ))}
          </div>
          <div className={styles.connectButtonContainer}>
            {isClient ? (
              isConnected ? (
                <div
                  className={styles.navbarLi}
                  onClick={toggleConnectMenuOpen}
                  ref={dropdownRef}
                >
                  <MinidenticonImg
                    username={String(address)}
                    saturation={90}
                    width={30}
                    height={30}
                    lightness={50}
                  />
                  <p className={`${styles.connectText} ${styles.toHide}`}>
                    {address
                      ? `${address.slice(0, 6)}...${address.slice(-4)}`
                      : "Error"}
                  </p>
                  <Image
                    src="/assets/icons/dropdown.svg"
                    alt="dropdown"
                    width={15}
                    height={15}
                    className={styles.dropdownIcon}
                  />
                </div>
              ) : (
                <div
                  className={`${styles.navbarLi} ${styles.connectButton}`}
                  onClick={toggleConnectOpen}
                >
                  <p className={styles.connectText}>Connect</p>
                </div>
              )
            ) : (
              <div
                className={`${styles.navbarLi} ${styles.connectButtonWhite}`}
              >
                <p className={styles.connectText}>Loading...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
