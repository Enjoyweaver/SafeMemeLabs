import React, { useEffect } from "react"

import "@/styles/globals.css"

const Bubbles = () => {
  useEffect(() => {
    const createBubble = () => {
      const bubble = document.createElement("div")
      bubble.className = "bubble"
      bubble.style.left = `${Math.random() * 100}%`
      bubble.style.animationDuration = `3s` // Fixed duration for the animation
      bubble.style.backgroundColor = `hsla(${
        Math.random() * 360
      }, 100%, 75%, 0.7)` // Pastel color
      bubble.style.width = `${Math.random() * 30 + 10}px` // Size between 10px and 40px
      bubble.style.height = bubble.style.width

      // Add bubble to the document
      document.body.appendChild(bubble)

      // Remove bubble after 3 seconds
      setTimeout(() => {
        bubble.remove()
      }, 3000)
    }

    const createBubbleStream = () => {
      for (let i = 0; i < 100; i++) {
        setTimeout(createBubble, i * 30) // Create 100 bubbles with a slight delay between them
      }
    }

    // Initial stream of bubbles
    createBubbleStream()

    // Event listener for mouse clicks
    document.addEventListener("click", createBubbleStream)

    return () => {
      document.removeEventListener("click", createBubbleStream)
    }
  }, [])

  return null
}

export default Bubbles
