import type { Metadata } from "next"
import { getFrameMetadata } from "@coinbase/onchainkit"

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Mint Random NFT",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/Adam_G.jpg`, // Use the first image URL as placeholder
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
      <h1>Mint NFT</h1>
      <form
        method="POST"
        action={`${process.env.NEXT_PUBLIC_SITE_URL}/api/mint`}
      >
        <input type="text" name="email" placeholder="Your Email" />
        <input
          type="text"
          name="userAddress"
          placeholder="Your Wallet Address"
        />
        <button type="submit">Mint Random NFT</button>
      </form>
    </>
  )
}
