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

  return (
    <nav className={styles.nav}>
      {/* Overlay and Connect Wallet components */}
      {!isConnected && connectOpen && <Overlay onClick={toggleConnectOpen} />}
      {!isConnected && connectOpen && <ConnectWallet />}

      <div className={styles.toShow}>
        <MobileNav />
      </div>

      <div className={styles.navbar}>
        {isClient ? (
          isConnected ? (
            // Display user details when connected
            <div className={styles.connectButtonContainer}>
              <div
                className={`${styles.navbarLi}`}
                onClick={toggleConnectMenuOpen}
                ref={dropdownRef} // Assign the ref to the dropdown menu
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
              <div
                className={`${styles.dropdown} ${
                  connectMenuOpen
                    ? styles.connectMenuOpen
                    : styles.connectMenuClosed
                }`}
              >
                <p
                  className={styles.dropdownOption}
                  onClick={() => {
                    disconnect()
                    setConnectMenuOpen(false) // Close the dropdown after disconnect
                  }}
                >
                  Disconnect
                </p>
                <Link href="/app/marketing/mytokens">
                  <p className={styles.dropdownOption}>My Tokens</p>
                </Link>
              </div>
            </div>
          ) : (
            // Show connect button when not connected
            <div
              className={`${styles.navbarLi} ${styles.connectButton}`}
              onClick={toggleConnectOpen}
            >
              <p className={styles.connectText}>Connect</p>
            </div>
          )
        ) : (
          // Show loading state
          <div className={`${styles.navbarLi} ${styles.connectButtonWhite}`}>
            <p className={styles.connectText}>Loading...</p>
          </div>
        )}

        {isClient && isConnected ? (
          // Display network options when connected
          <div className={styles.networkOptionsContainer}>
            <h3 className={styles.networkTitle}>Choose from these options</h3>
            <div className={styles.networkOptions}>
              {chainDetails.map((chain) => (
                <button
                  key={chain.chainId}
                  className={`${styles.navbarLi} ${
                    chain.name === tempNetwork ? styles.active : ""
                  }`}
                  onClick={() =>
                    dropdownAction(() => switchNetwork?.(chain.chainId))
                  }
                >
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    className={styles.chainLogo}
                    height={30}
                    width={30}
                  />
                  {chain.name}
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Display network options in a disconnected state
          <div className={styles.networkOptionsContainer}>
            <h3 className={styles.networkTitle}>Choose from these options</h3>
            <div className={styles.networkOptions}>
              {chainDetails.map((chain) => (
                <button
                  key={chain.chainId}
                  className={`${styles.navbarLi} ${
                    chain.name === tempNetwork ? styles.active : ""
                  }`}
                  onClick={() =>
                    dropdownAction(() => setTempNetwork(chain.name))
                  }
                >
                  <Image
                    src={chain.logo}
                    alt={chain.name}
                    className={styles.chainLogo}
                    height={23}
                    width={23}
                  />
                  <span
                    style={{
                      color: isClient
                        ? isConnected
                          ? "var(--blockchain-text-color)"
                          : "var(--blockchain-text-color-dark)"
                        : "var(--blockchain-text-color)",
                    }}
                  >
                    {chain.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {menuItems.map((item, index) => (
          <div key={index} className={styles.navbarOptionsContainer}>
            <div
              className={` ${styles.navbarLi} ${styles.active}`}
              onClick={() => toggleMenu(index)}
            >
              {/* //TODO: FIX THIS */}
              {/* <p className={`${styles.connectText} ${styles.toHide}`}>
                {item.label}
              </p> */}
            </div>
            <div
              className={`${styles.dropdownLeft} ${
                menusOpen[index]
                  ? styles.connectMenuOpen
                  : styles.connectMenuClosed
              }`}
            >
              {/* {//TODO: FIX THIS} */}
              {/* {item.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href}>
                  <p className={styles.dropdownOption}>{link.text}</p>
                </Link>
              ))} */}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
