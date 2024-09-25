"use client"

import React, { useEffect, useState } from "react"
import Head from "next/head"
import { useRouter } from "next/router"
import { blockExplorerAddress, chains } from "@/Constants/config"
import ArDB from "ardb"
import Arweave from "arweave"

import "../styles/arweaveprofile.css"

interface ProfileData {
  handleName?: string
  name?: string
  bio?: string
  avatarURL?: string
  bannerURL?: string
  email?: string
  website?: string
  links?: {
    twitter?: string
    instagram?: string
    tiktok?: string
    website?: string
    github?: string
    discord?: string
    linkedin?: string
    facebook?: string
    youtube?: string
    twitch?: string
  }
  wallets?: {
    [key: string]: string
  }
}

const SharedProfilePage: React.FC = () => {
  const router = useRouter()
  const { handle } = router.query
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!handle) return

    const fetchProfile = async () => {
      try {
        const arweave = Arweave.init({
          host: "arweave.net",
          port: 443,
          protocol: "https",
        })
        const ardb = new ArDB(arweave)
        const userHandle = typeof handle === "string" ? handle : handle[0]
        const transactions = await ardb
          .search("transactions")
          .tag("App-Name", "SafeMemes.fun")
          .find()
        if (transactions.length === 0) {
          setError("Profile not found.")
          setLoading(false)
          return
        }
        const matchingTransactions = []
        for (const tx of transactions) {
          try {
            const dataString = await arweave.transactions.getData(tx.id, {
              decode: true,
              string: true,
            })
            const data = JSON.parse(dataString)
            if (data.handleName === userHandle) {
              matchingTransactions.push(tx)
            }
          } catch (parseError) {
            console.warn(`Failed to parse transaction ${tx.id}:`, parseError)
          }
        }
        if (matchingTransactions.length === 0) {
          setError("Profile not found.")
          setLoading(false)
          return
        }
        matchingTransactions.sort((a, b) => {
          const aHeight = a.block_height || 0
          const bHeight = b.block_height || 0
          return bHeight - aHeight
        })
        const latestTx = matchingTransactions[0]
        const latestDataString = await arweave.transactions.getData(
          latestTx.id,
          {
            decode: true,
            string: true,
          }
        )
        const latestData = JSON.parse(latestDataString)
        setProfileData({
          handleName: latestData.handleName || "",
          name: latestData.name || "",
          bio: latestData.bio || "",
          avatarURL: latestData.avatar
            ? `https://arweave.net/${latestData.avatar}`
            : "",
          bannerURL: latestData.banner
            ? `https://arweave.net/${latestData.banner}`
            : "",
          email: latestData.email || "",
          website: latestData.website || "",
          links: latestData.links || {},
          wallets: latestData.wallets || {},
        })
      } catch (error) {
        console.error("Error fetching profile:", error)
        setError("An error occurred while fetching the profile.")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [handle])

  if (loading) return <p>Loading...</p>
  if (error) return <p>{error}</p>
  if (!profileData) return null

  return (
    <>
      <Head>
        <title>
          {profileData.name || profileData.handleName} | SafeMeme Labs
        </title>
        <meta name="description" content={profileData.bio || "User Profile"} />
        <link rel="icon" href="/images/SafeMemeLogo.png" />
        <meta
          property="og:title"
          content={`${
            profileData.name || profileData.handleName
          } | SafeMeme Labs`}
        />
        <meta
          property="og:description"
          content={profileData.bio || "User Profile"}
        />
        <meta
          property="og:image"
          content={profileData.avatarURL || "/images/SafeMemeLogo.png"}
        />
        <meta
          property="og:url"
          content={`https://safememes.fun/${profileData.handleName}`}
        />
        <meta property="og:type" content="profile" />
        <meta property="profile:username" content={profileData.handleName} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content={`${
            profileData.name || profileData.handleName
          } | SafeMeme Labs`}
        />
        <meta
          name="twitter:description"
          content={profileData.bio || "User Profile"}
        />
        <meta
          name="twitter:image"
          content={profileData.avatarURL || "/images/SafeMemeLogo.png"}
        />
        <meta name="twitter:creator" content="@SafeMemeLabs" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: profileData.name || profileData.handleName,
              url: `https://safememes.fun/${profileData.handleName}`,
              image: profileData.avatarURL || "/images/SafeMemeLogo.png",
              description: profileData.bio || "User Profile",
            }),
          }}
        />
      </Head>

      <div className="shared-profile-page">
        <div className="profile-banner">
          <img
            src={profileData.bannerURL}
            alt="Banner"
            className="banner-image"
          />
          <div className="profile-image">
            <img
              src={profileData.avatarURL}
              alt="Profile"
              className="profile-picture"
            />
          </div>
        </div>
        <div className="profile-info">
          <div className="profile-fields-row">
            <div className="profile-field">
              <label htmlFor="handle">Handle:</label>
              <span id="handle" className="profile-handle">
                @{profileData.handleName}
              </span>
            </div>
          </div>
          <div className="secondprofile-fields-row">
            <div className="profile-field">
              <label htmlFor="name">Name:</label>
              <span id="name" className="profile-name">
                {profileData.name}
              </span>
            </div>
          </div>
          <div className="profile-field">
            <label htmlFor="bio">Bio:</label>
            <span id="bio" className="profile-bio">
              {profileData.bio}
            </span>
          </div>
          {profileData.email && (
            <div className="profile-field">
              <label htmlFor="email">Email:</label>
              <span id="email" className="profile-email">
                {profileData.email}
              </span>
            </div>
          )}
          {profileData.website && (
            <div className="profile-field">
              <label htmlFor="website">Website:</label>
              <a
                href={profileData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="profile-website"
              >
                {profileData.website}
              </a>
            </div>
          )}
        </div>
        <div className="social-links">
          {profileData.links?.twitter && (
            <div className="profile-field">
              <label>Twitter:</label>
              <a
                href={`https://twitter.com/${profileData.links.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                @{profileData.links.twitter}
              </a>
            </div>
          )}
          {profileData.links?.instagram && (
            <div className="profile-field">
              <label>Instagram:</label>
              <a
                href={`https://instagram.com/${profileData.links.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                @{profileData.links.instagram}
              </a>
            </div>
          )}
          {profileData.links?.tiktok && (
            <div className="profile-field">
              <label>TikTok:</label>
              <a
                href={`https://tiktok.com/@${profileData.links.tiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                @{profileData.links.tiktok}
              </a>
            </div>
          )}
          {profileData.links?.website && (
            <div className="profile-field">
              <label>Website:</label>
              <a
                href={profileData.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.website}
              </a>
            </div>
          )}
          {profileData.links?.github && (
            <div className="profile-field">
              <label>GitHub:</label>
              <a
                href={`https://github.com/${profileData.links.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.github}
              </a>
            </div>
          )}
          {profileData.links?.discord && (
            <div className="profile-field">
              <label>Discord:</label>
              <a
                href={`https://discord.com/users/${profileData.links.discord}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.discord}
              </a>
            </div>
          )}
          {profileData.links?.linkedin && (
            <div className="profile-field">
              <label>LinkedIn:</label>
              <a
                href={`https://linkedin.com/in/${profileData.links.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.linkedin}
              </a>
            </div>
          )}
          {profileData.links?.facebook && (
            <div className="profile-field">
              <label>Facebook:</label>
              <a
                href={`https://facebook.com/${profileData.links.facebook}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.facebook}
              </a>
            </div>
          )}
          {profileData.links?.youtube && (
            <div className="profile-field">
              <label>YouTube:</label>
              <a
                href={`https://youtube.com/${profileData.links.youtube}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.youtube}
              </a>
            </div>
          )}
          {profileData.links?.twitch && (
            <div className="profile-field">
              <label>Twitch:</label>
              <a
                href={`https://twitch.tv/${profileData.links.twitch}`}
                target="_blank"
                rel="noopener noreferrer"
                className="social-handle"
              >
                {profileData.links.twitch}
              </a>
            </div>
          )}
        </div>

        <div className="wallets">
          <h4>Wallet Addresses:</h4>
          {profileData.wallets &&
          Object.keys(profileData.wallets).length > 0 ? (
            <ul>
              {Object.entries(profileData.wallets).map(([chainId, address]) => (
                <li key={chainId}>
                  <strong>
                    {chains.find((chain) => chain.id.toString() === chainId)
                      ?.name || "Unknown Blockchain"}
                    :
                  </strong>{" "}
                  <a
                    href={`${blockExplorerAddress[chainId]}${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {address.slice(0, 6)}...{address.slice(-6)}
                  </a>{" "}
                  (Verified)
                </li>
              ))}
            </ul>
          ) : (
            <p>No wallet addresses added.</p>
          )}
        </div>
      </div>
    </>
  )
}

export default SharedProfilePage
