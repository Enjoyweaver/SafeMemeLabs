import type { Metadata } from "next"
import Image from "next/image"
import { getFrameMetadata } from "@coinbase/onchainkit"

import styles from "./page.module.css"

const images = [
  "Hank.jpg",
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

const currentIndex = 0 // Default index for the frame

// Frame metadata
const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Previous",
      action: "post",
      postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint/prev`,
    },
    {
      label: "Next",
      action: "post",
      postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint/next`,
    },
    {
      label: "Mint Selected NFT",
      action: "post",
      postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
    },
    {
      label: "Back to SafeMeme",
      action: "link",
      target: "https://SafeMeme.vercel.app/frames",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`,
    aspect_ratio: "1:1",
  },
  postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
  input: {
    text: "Your Wallet Address",
  },
  frameVersion: "vNext",
})

// Page metadata
export const metadata: Metadata = {
  title: "SafeFrames",
  description: "Mint one of the 777 unique NFTs",
  openGraph: {
    title: "Mint NFT",
    description: "Mint one of the 777 unique NFTs",
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
