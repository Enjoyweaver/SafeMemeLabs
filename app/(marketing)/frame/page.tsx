import type { Metadata } from "next"
import { getFrameMetadata } from "@coinbase/onchainkit/frame"

const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: "Sign Up!",
    },
  ],
  image: {
    src: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.svg`,
  },
  input: {
    text: "Your Email",
  },
  postUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/advanced`,
})

export const metadata: Metadata = {
  title: "Safe Frame",
  description: "Another, more advanced frame example",
  openGraph: {
    title: "Safe Frame",
    description: "Another, more advanced frame example",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/logo.svg`],
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
