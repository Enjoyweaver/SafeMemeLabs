"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getFrameMetadata } from "@coinbase/onchainkit"

import styles from "./page.module.css"

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Mint Random NFT",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/Adam G.jpg`,
  },
  input: {
    text: "Your Wallet Address",
  },
  postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
})

function MintedCount() {
  const [mintedCount, setMintedCount] = useState(0)

  useEffect(() => {
    const fetchMintedCount = async () => {
      const response = await fetch("/api/mint/count")
      const data = await response.json()
      setMintedCount(data.count)
    }

    fetchMintedCount()
  }, [])

  return (
    <p className={styles.counter}>NFTs Left to Mint: {777 - mintedCount}</p>
  )
}

export default function Page() {
  const images = [
    "Abigail.jpg",
    "Adele.jpg",
    "Clark Fable.jpg",
    "Cliff.jpg",
    "Destiny.jpg",
    "Dole.jpg",
    "Duck Warhol.jpg",
    "John.jpg",
    "Josephine.jpg",
    "Miss Grace.jpg",
    "Miss Tonya.jpg",
    "Weatherby.jpg",
    "Virgil.jpg",
    "Swirly.jpg",
    "Straw.jpg",
  ]

  return (
    <>
      <div className={styles.pageContainer}>
        <h1 className={styles.title}>Mint Your NFT with our Safe Frames</h1>
        <MintedCount />
        <div className={styles.imageGallery}>
          {images.map((image, index) => (
            <div key={index} className={styles.imageContainer}>
              <Image
                src={`/images/luckyducks/${image}`}
                alt={`Placeholder ${index + 1}`}
                width={200}
                height={200}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
