import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Safe Frame",
  description: "A Farcaster Frame Demo",
  openGraph: {
    title: "Safe Frame",
    description: "A Farcaster Frame Demo",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
    "fc:frame:post_url": `${process.env.NEXT_PUBLIC_SITE_URL}/api/basic?id=1`,
    "fc:frame:button:1": "Start",
  },
}

export default function Page() {
  return (
    <div>
      <h1>Safe Frame</h1>
    </div>
  )
}
