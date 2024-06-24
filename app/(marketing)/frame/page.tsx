"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { getFrameMetadata } from "@coinbase/onchainkit"

import styles from "./page.module.css"

// Function to fetch the list of images
const fetchImages = async () => {
  const response = await fetch("/api/images")
  const data = await response.json()
  return data
}

// Function to fetch the minted count
const fetchMintedCount = async () => {
  const response = await fetch("/api/mint/count")
  const data = await response.json()
  return data.count
}

const Frame = () => {
  const [images, setImages] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mintedCount, setMintedCount] = useState(0)

  useEffect(() => {
    const initializeImages = async () => {
      const fetchedImages = [
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
      setImages(fetchedImages)
    }

    const initializeMintedCount = async () => {
      const count = await fetchMintedCount()
      setMintedCount(count)
    }

    initializeImages()
    initializeMintedCount()
  }, [])

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    )
  }

  return (
    <div className={styles.frameContainer}>
      <h1 className={styles.title}>Mint Your NFT with our Safe Frames</h1>
      <p className={styles.counter}>NFTs Left to Mint: {777 - mintedCount}</p>
      <div className={styles.navButtons}>
        <button onClick={handlePrev} className={styles.navButton}>
          Previous
        </button>
        {images.length > 0 && (
          <Image
            src={`${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`}
            alt={`Image ${currentIndex + 1}`}
            width={200}
            height={200}
          />
        )}
        <button onClick={handleNext} className={styles.navButton}>
          Next
        </button>
      </div>
      <meta property="fc:frame" content="vNext" />
      <meta
        property="fc:frame:image"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`}
      />
      <meta
        property="og:image"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`}
      />
      <meta
        property="fc:frame:post_url"
        content={`${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`}
      />
      <meta property="fc:frame:button:1" content="Mint Selected NFT" />
    </div>
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
