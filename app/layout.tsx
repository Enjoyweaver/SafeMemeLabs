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
  description: siteConfig.description,
  keywords: [
    "safe meme",
    "meme",
    "token generator",
    "pump.fun",
    "memes",
    "safememe",
    "pump fun",
    "degen express",
    "memeboxfi",
    "meme box fi",
  ],
  authors: [
    {
      name: "SafeMeme Labs",
      url: "https://Safememe.vercel.app",
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
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${siteConfig.url}/logo.png`],
    creator: "@SafeMemeLabs",
  },
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
  manifest: "/site.webmanifest",
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="icon" href="/favicon.ico" />
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
