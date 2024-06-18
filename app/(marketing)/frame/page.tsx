import type { Metadata } from "next"
import { getFrameMetadata } from "@coinbase/onchainkit"

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Mint Random NFT",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/Adam G.jpg`, // Ensure this is a valid image URL
  },
  input: {
    text: "Your Wallet Address",
  },
  postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`,
})

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

export default function Page() {
  return (
    <>
      <h1>Safe Frame</h1>
    </>
  )
}
