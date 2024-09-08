"use client"

import { useEffect, useState } from "react"

export default function Sidebar() {
  const [currentSection, setCurrentSection] = useState("")

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        "intro",
        "safememes",
        "safelaunch",
        "profile",
        "frames",
        "nfts",
        "rewards",
        "airdrop",
        "dashboard",
        "insurance",
      ]
      let current = ""

      sections.forEach((section) => {
        const element = document.getElementById(section)
        if (
          element &&
          element.getBoundingClientRect().top < window.innerHeight / 2
        ) {
          current = section
        }
      })

      setCurrentSection(current)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      document.body.classList.add("scrolling")

      clearTimeout(window.scrollTimeout)
      window.scrollTimeout = setTimeout(() => {
        document.body.classList.remove("scrolling")
      }, 200) // Adjust timeout duration as needed
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="sidebar">
      <ul>
        <li className={currentSection === "about" ? "active" : ""}>
          <a href="#intro">Intro</a>
        </li>
        <li className={currentSection === "safememes" ? "active" : ""}>
          <a href="#safememes">SafeMemes</a>
        </li>
        <li className={currentSection === "safelaunch" ? "active" : ""}>
          <a href="#safelaunch">SafeLaunch</a>
        </li>
        <li className={currentSection === "profile" ? "active" : ""}>
          <a href="#profile">Profile</a>
        </li>
        <li className={currentSection === "frames" ? "active" : ""}>
          <a href="#frames">Frames</a>
        </li>
        <li className={currentSection === "nfts" ? "active" : ""}>
          <a href="#nfts">NFTs</a>
        </li>
        <li className={currentSection === "rewards" ? "active" : ""}>
          <a href="#rewards">Rewards</a>
        </li>
        <li className={currentSection === "airdrop" ? "active" : ""}>
          <a href="#airdrop">Airdrop</a>
        </li>
        <li className={currentSection === "dashboard" ? "active" : ""}>
          <a href="#dashboard">Dashboard</a>
        </li>
        <li className={currentSection === "insurance" ? "active" : ""}>
          <a href="#insurance">Insurance</a>
        </li>
      </ul>
    </div>
  )
}
