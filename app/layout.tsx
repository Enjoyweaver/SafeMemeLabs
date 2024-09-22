import { Inter as FontSans } from "next/font/google"
import localFont from "next/font/local"

import "@/styles/globals.css"
import { config } from "@/Constants/config"
import { ToastContainer } from "react-toastify"
import { WagmiConfig } from "wagmi"

import { siteConfig } from "@/config/site"
import { absoluteUrl, cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/toaster"
import { Analytics } from "@/components/analytics"
import { ThemeProvider } from "@/components/theme-provider"

import { DatafeedProvider } from "./(marketing)/datafeed-provider"
import { SocketProvider } from "./(marketing)/socket-provider"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// Font files can be colocated inside of `pages`
const fontHeading = localFont({
  src: "../assets/fonts/CalSans-SemiBold.woff2",
  variable: "--font-heading",
})

interface RootLayoutProps {
  children: React.ReactNode
}

export const metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description:
    "Building the safe meme economy tools you need to create rugproof tokens, safe Frames, and send airdrops.",
  keywords: [
    "safe meme",
    "meme",
    "token generator",
    "pump.fun",
    "pump fun",
    "memes",
    "safememe",
    "degen express",
    "memeboxfi",
    "meme box fi",
    "blockchain",
    "rugproof tokens",
    "DeFi",
    "NFTs",
    "airdrops",
    "Arweave",
    "Vyper",
    "smart contracts",
    "liquidity",
    "SafeLaunch",
    "crypto meme",
    "crypto token",
    "safe token",
  ],
  authors: [
    {
      name: "SafeMeme Labs",
      url: "https://safememes.fun",
    },
  ],
  creator: "SafeMeme Labs",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description:
      "Developing the safe meme economy tools you need to create rugproof tokens, build safe Frames, and share airdrops.",
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/images/SafeMemeLogo.png`,
        width: 1200,
        height: 630,
        alt: "SafeMeme Labs Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/images/SafeMemeLogo.png`],
    creator: "@SafeMemeLabs",
  },
  icons: {
    icon: "/images/SafeMemeLogo.png",
    shortcut: "/images/SafeMemeLogo.png",
    apple: "/images/SafeMemeLogo.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/images/SafeMemeLogo.png" />
        <meta name="theme-color" content="#000000" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontHeading.variable
        )}
      >
        <DatafeedProvider>
          <SocketProvider>
            <WagmiConfig config={config}>
              <ToastContainer />
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                {children}
                <Analytics />
                <Toaster />
              </ThemeProvider>
            </WagmiConfig>
          </SocketProvider>
        </DatafeedProvider>
      </body>
    </html>
  )
}
