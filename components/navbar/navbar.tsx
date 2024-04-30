"use client"

import { FC, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { chains } from "@/Constants/config"
import { minidenticon } from "minidenticons"
import { useAccount, useDisconnect, useNetwork, useSwitchNetwork } from "wagmi"

import { ConnectWallet } from "../changeNetwork/connectWallet/connectWallet"
import { MobileNav } from "../mobileNav/navbar"
import { Overlay } from "../overlay/overlay"
import styles from "./navbar.module.css"

interface MinidenticonImgProps {
  username: string
  saturation: number
  lightness: number
  [key: string]: any
}

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

const chainDetails = [
  { name: "Fantom", chainId: 250, logo: "/assets/icons/logos/fantom.png" },
  {
    name: "Fantom Testnet",
    chainId: 4002,
    logo: "/assets/icons/logos/fantom.png",
  },
  //{ name: "Polygon", chainId: 137, logo: "/assets/icons/logos/polygon.png" },

  // {
  //   name: "Fantom Sonic",
  //   chainId: 64165,
  //   logo: "/assets/icons/logos/fantom.png",
  // },
  {
    name: "Degen",
    chainId: 666666666,
    logo: "/assets/icons/logos/degen.png",
  },
]

export function Navbar() {
  const [connectOpen, setConnectOpen] = useState<boolean>(false)
  const [connectMenuOpen, setConnectMenuOpen] = useState<boolean>(false)
  const [networkMenuOpen, setNetworkMenuOpen] = useState<boolean>(false)
  const [isClient, setIsClient] = useState<boolean>(false)
  const [tempNetwork, setTempNetwork] = useState<string>("Not Connected")
  const [menusOpen, setMenusOpen] = useState<boolean[]>([false, false])

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  const toggleConnectOpen = () => {
    setConnectOpen(!connectOpen)
  }

  const toggleConnectMenuOpen = () => {
    if (!connectMenuOpen) {
      setNetworkMenuOpen(false)
      setMenusOpen([])
    }
    setConnectMenuOpen(!connectMenuOpen)
  }

  const toggleNetworkMenuOpen = () => {
    if (!networkMenuOpen) {
      setConnectMenuOpen(false)
      setMenusOpen([])
    }
    setNetworkMenuOpen(!networkMenuOpen)
  }

  const toggleMenu = (index: number) => {
    if (!menusOpen[index]) {
      const updatedMenusOpen: boolean[] = []
      setConnectMenuOpen(false)
      setNetworkMenuOpen(false)
      updatedMenusOpen[index] = !updatedMenusOpen[index]
      setMenusOpen(updatedMenusOpen)
    } else {
      const updatedMenusOpen: boolean[] = []
      setConnectMenuOpen(false)
      setNetworkMenuOpen(false)
      setMenusOpen(updatedMenusOpen)
    }
  }

  function dropdownAction(func: () => void): void {
    func()
    setMenusOpen([])
    setConnectMenuOpen(false)
    setNetworkMenuOpen(false)
  }

  const { chain } = useNetwork()
  const { error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <nav>
      {!isConnected && connectOpen && <Overlay onClick={toggleConnectOpen} />}
      {!isConnected && connectOpen && <ConnectWallet />}
      <div className={styles.toShow}>
        <MobileNav />
      </div>
      <div className={styles.navbar}>
        {isClient ? (
          isConnected ? (
            <div className={styles.connectButtonContainer}>
              <div
                className={`${styles.navbarLi}`}
                onClick={toggleConnectMenuOpen}
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
                    ? address?.slice(0, 6) + "..." + address?.slice(-4)
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
                  onClick={() => dropdownAction(() => disconnect())}
                >
                  Disconnect
                </p>
                <Link href="/app/mytokens">
                  <p className={styles.dropdownOption}>My Tokens</p>
                </Link>
              </div>
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
          <div className={`${styles.navbarLi} ${styles.connectButton}`}>
            <p className={styles.connectText}>Loading...</p>
          </div>
        )}
        {isClient ? (
          isConnected ? (
            <div className={styles.connectButtonContainer}>
              <div
                className={`${styles.navbarLi}`}
                onClick={toggleNetworkMenuOpen}
              >
                <Image
                  src={
                    chainDetails.find(
                      (chain_) => chain_.name === (chain && chain.name)
                    )?.logo || "/assets/icons/logos/degen.png"
                  }
                  alt={
                    chainDetails.find(
                      (chain_) => chain_.name === (chain && chain.name)
                    )?.name || "Fantom"
                  }
                  width={23}
                  height={23}
                  className={styles.chainIcon}
                />
                <p className={`${styles.connectText} ${styles.toHide}`}>
                  {chain
                    ? chains.map((item) => Number(item.id)).includes(chain.id)
                      ? chain.name
                      : "Unsupported"
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
                  networkMenuOpen
                    ? styles.connectMenuOpen
                    : styles.connectMenuClosed
                }`}
              >
                {chainDetails.map((chain) => (
                  <p
                    key={chain.chainId}
                    className={styles.dropdownOption}
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
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.connectButtonContainer}>
              <div
                className={`${styles.navbarLi}`}
                onClick={toggleNetworkMenuOpen}
              >
                <Image
                  src={
                    chainDetails.find((chain) => chain.name === tempNetwork)
                      ?.logo || "/assets/icons/logos/degen.png"
                  }
                  alt={
                    chainDetails.find((chain) => chain.name === tempNetwork)
                      ?.name || "Fantom"
                  }
                  width={23}
                  height={23}
                  className={styles.chainIcon}
                />
                <p className={`${styles.connectText} ${styles.toHide}`}>
                  {tempNetwork}
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
                  networkMenuOpen
                    ? styles.connectMenuOpen
                    : styles.connectMenuClosed
                }`}
              >
                {chainDetails.map((chain) => (
                  <p
                    key={chain.chainId}
                    className={styles.dropdownOption}
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
                    {chain.name}
                  </p>
                ))}
              </div>
            </div>
          )
        ) : (
          <div className={`${styles.navbarLi} ${styles.connectButtonWhite}`}>
            <Image
              src="/assets/icons/logos/fantom.png"
              alt="Fantom"
              width={23}
              height={23}
              className={styles.chainIcon}
            />
            <p className={`${styles.connectText} ${styles.toHide}`}>Fantom</p>
          </div>
        )}

        {menuItems.map((item, index) => (
          <div key={index} className={styles.navbarOptionsContainer}>
            <div
              className={`${styles.navLeft} ${styles.navbarLi} ${styles.active}`}
              onClick={() => toggleMenu(index)}
            >
              <p className={`${styles.connectText} ${styles.toHide}`}>
                {item.label}
              </p>
            </div>
            <div
              className={`${styles.dropdownLeft} ${
                menusOpen[index]
                  ? styles.connectMenuOpen
                  : styles.connectMenuClosed
              }`}
            >
              {item.links.map((link, linkIndex) => (
                <Link key={linkIndex} href={link.href}>
                  <p className={styles.dropdownOption}>{link.text}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </nav>
  )
}
