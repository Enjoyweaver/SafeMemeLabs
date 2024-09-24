// [handle].tsx

import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
import { chains } from "@/Constants/config"
import Arweave from "arweave"
import Account, { ArAccount } from "arweave-account"

import "../styles/arweaveprofile.css"

interface ProfileData {
  handleName?: string
  name?: string
  bio?: string
  avatarURL?: string
  bannerURL?: string
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
        const arweave = Arweave.init({})
        const account = new Account(arweave)

        const userHandle = typeof handle === "string" ? handle : handle[0]
        const users = await account.search(userHandle)

        if (users && users.length > 0) {
          const matchedUser = users.find(
            (user) => user.profile.handleName === userHandle
          )

          if (matchedUser) {
            setProfileData({
              handleName: matchedUser.profile.handleName,
              name: matchedUser.profile.name,
              bio: matchedUser.profile.bio,
              avatarURL: matchedUser.profile.avatarURL,
              bannerURL: matchedUser.profile.bannerURL,
              links: matchedUser.profile.links,
              wallets: matchedUser.profile.wallets,
            })
          } else {
            setError("Profile not found.")
          }
        } else {
          setError("Profile not found.")
        }
      } catch (err) {
        console.error("Error fetching profile:", err)
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
    <div className="shared-profile-page">
      <div className="profile-banner">
        {profileData.bannerURL ? (
          <img
            src={profileData.bannerURL}
            alt="Banner"
            className="banner-image"
          />
        ) : (
          <div className="placeholder-banner">No Banner</div>
        )}
        <div className="profile-image">
          {profileData.avatarURL ? (
            <img
              src={profileData.avatarURL}
              alt="Profile"
              className="profile-picture"
            />
          ) : (
            <div className="placeholder-image">No Image</div>
          )}
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
          <div className="profile-field">
            <label htmlFor="name">Name:</label>
            <span id="name" className="profile-name">
              {profileData.name}
            </span>
          </div>
        </div>
        {/* Bio Below */}
        <div className="profile-field">
          <label htmlFor="bio">Bio:</label>
          <span id="bio" className="profile-bio">
            {profileData.bio}
          </span>
        </div>
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
        {profileData.wallets && Object.keys(profileData.wallets).length > 0 ? (
          <ul>
            {Object.entries(profileData.wallets).map(([chainId, address]) => (
              <li key={chainId}>
                <strong>
                  {chains.find((chain) => chain.id.toString() === chainId)
                    ?.name || "Unknown Blockchain"}
                  :
                </strong>{" "}
                {address.slice(0, 6)}...{address.slice(-6)} (Verified)
              </li>
            ))}
          </ul>
        ) : (
          <p>No wallet addresses added.</p>
        )}
      </div>
    </div>
  )
}

export default SharedProfilePage
