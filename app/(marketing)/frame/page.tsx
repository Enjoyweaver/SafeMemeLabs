"use client"

import { useState } from "react"

export default function Page() {
  const [email, setEmail] = useState("")
  const [userAddress, setUserAddress] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [message, setMessage] = useState("")

  const handleMint = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userAddress }),
        }
      )

      const data = await response.json()

      if (data.success) {
        setImageUrl(data.imageUrl)
        setMessage("Minting successful!")
      } else {
        setMessage(`Minting failed: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Minting failed: ${error.message}`)
    }
  }

  return (
    <>
      <h1>Safe Frame</h1>
      <div>
        <input
          type="text"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="Your Wallet Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <button onClick={handleMint}>Mint Random NFT</button>
        {imageUrl && <img src={imageUrl} alt="Minted NFT" />}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}
