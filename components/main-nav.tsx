"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelectedLayoutSegment } from "next/navigation"

import { MainNavItem } from "types"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { MobileNav } from "@/components/mobile-nav"

interface MainNavProps {
  items?: MainNavItem[]
  children?: React.ReactNode
}

export function MainNav({ items, children }: MainNavProps) {
  const segment = useSelectedLayoutSegment()
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false)

  return (
    <div className="flex items-center gap-6 md:gap-10">
      {/* Logo and Site Name */}
      <Link href="/" className="hidden items-center space-x-2 md:flex">
        <Image
          src="/images/SafeMemeLogo.png"
          alt="SafeMeme Logo"
          width={40} // Set width of the logo
          height={40} // Set height of the logo
          className="h-10 w-10" // Adjust to match your design
        />
        <span className="hidden font-bold sm:inline-block">
          {siteConfig.name}
        </span>
      </Link>

      {/* Navigation Items */}
      {items?.length ? (
        <nav className="hidden gap-6 md:flex">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                item.href.startsWith(`/${segment}`)
                  ? "text-foreground"
                  : "text-foreground/60",
                item.disabled && "cursor-not-allowed opacity-80"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}

      {/* Flex Spacer */}
      <div className="grow" />

      <Link
        href="/getstarted"
        className="flex items-center text-lg font-medium hover:text-foreground/80 sm:text-sm"
      >
        How to Get Started
      </Link>

      <Link
        href="/profile"
        className="flex items-center text-lg font-medium hover:text-foreground/80 sm:text-sm"
      >
        Profile
      </Link>

      {/* Mobile Menu Button */}
      <button
        className="flex items-center space-x-2 md:hidden"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        {showMobileMenu ? (
          <Image
            src="/images/SafeMemeLogo.png"
            alt="SafeMeme Logo"
            width={40}
            height={40}
            className="h-8 w-8"
          />
        ) : (
          <Image
            src="/images/SafeMemeLogo.png"
            alt="SafeMeme Logo"
            width={40}
            height={40}
            className="h-8 w-8"
          />
        )}
        <span className="font-bold">Menu</span>
      </button>

      {/* Mobile Navigation */}
      {showMobileMenu && items && (
        <MobileNav items={items}>{children}</MobileNav>
      )}
    </div>
  )
}
