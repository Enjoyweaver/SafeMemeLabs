"use client"

import * as React from "react"
import { useTheme } from "next-themes"

export function ModeToggle() {
  const { setTheme } = useTheme()

  // Ensure the theme is always set to dark when this component is mounted
  React.useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  return null
}
