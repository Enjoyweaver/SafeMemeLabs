import type { Metadata } from "next"
import Image from "next/image"
import { getFrameMetadata } from "@coinbase/onchainkit"

import styles from "./page.module.css"

// Frame metadata
const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Mint Selected NFT",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/Adam_G.jpg`,
  },
  input: {
    text: "Your Wallet Address",
  },
  postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
})

// Frame component
const Frame = () => {
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
    <div className={styles.frameContainer}>
      <h1 className={styles.title}>Mint Your NFT with our Safe Frames</h1>
      <div className={styles.navButtons}>
        <button onClick={handlePrev} className={styles.navButton}>
          Previous
        </button>
        <Image
          src={`${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`}
          alt={`Image ${currentIndex + 1}`}
          width={200}
          height={200}
        />
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

export const metadata: Metadata = {
  title: "Mint NFT",
  description: "Mint one of the 777 unique images as an NFT",
  openGraph: {
    title: "Mint NFT",
    description: "Mint one of the 777 unique images as an NFT",
    images: [
      `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/Adam_G.jpg`,
    ],
  },
  other: {
    ...frameMetadata,
  },
}

// Page component
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
