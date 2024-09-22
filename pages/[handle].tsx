import React, { useEffect, useState } from "react"
import { useRouter } from "next/router"
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

const ProfilePage: React.FC = () => {
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
    <div className="profile-page">
      <div className="profile-section">
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
          <h2>@{profileData.handleName}</h2>
          <h3>{profileData.name}</h3>
          <p>{profileData.bio}</p>
        </div>
        <div className="social-links">
          {profileData.links?.twitter && (
            <a href={`https://twitter.com/${profileData.links.twitter}`}>
              Twitter
            </a>
          )}
          {profileData.links?.instagram && (
            <a href={`https://instagram.com/${profileData.links.instagram}`}>
              Instagram
            </a>
          )}
          {profileData.links?.tiktok && (
            <a href={`https://tiktok.com/@${profileData.links.tiktok}`}>
              TikTok
            </a>
          )}
          {profileData.links?.website && (
            <a
              href={profileData.links.website}
              target="_blank"
              rel="noopener noreferrer"
            >
              Website
            </a>
          )}
          {profileData.links?.github && (
            <a href={`https://github.com/${profileData.links.github}`}>
              GitHub
            </a>
          )}
          {profileData.links?.discord && (
            <a href={`https://discord.com/users/${profileData.links.discord}`}>
              Discord
            </a>
          )}
          {profileData.links?.linkedin && (
            <a href={`https://linkedin.com/in/${profileData.links.linkedin}`}>
              LinkedIn
            </a>
          )}
          {profileData.links?.facebook && (
            <a href={`https://facebook.com/${profileData.links.facebook}`}>
              Facebook
            </a>
          )}
          {profileData.links?.youtube && (
            <a href={`https://youtube.com/${profileData.links.youtube}`}>
              YouTube
            </a>
          )}
          {profileData.links?.twitch && (
            <a href={`https://twitch.tv/${profileData.links.twitch}`}>Twitch</a>
          )}
        </div>

        {/* Wallet Addresses */}
        <div className="wallets">
          <h4>Wallet Addresses:</h4>
          {profileData.wallets &&
          Object.keys(profileData.wallets).length > 0 ? (
            <ul>
              {Object.entries(profileData.wallets).map(([type, address]) => (
                <li key={type}>
                  <strong>{type.toUpperCase()}:</strong> {address}
                </li>
              ))}
            </ul>
          ) : (
            <p>No wallet addresses added.</p>
          )}
        </div>
      </div>

      <div className="login-section"></div>
    </div>
  )
}

export default ProfilePage
