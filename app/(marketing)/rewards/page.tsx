"use client"

import { useEffect, useState } from "react"
import { getBubblesActivity } from "@/APIs/getBubblesActivity"

const Rewards = () => {
  const [buys, setBuys] = useState([])
  const [sells, setSells] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await getBubblesActivity()
        setBuys(data.buys)
        setSells(data.sells)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchActivity()
  }, [])

  if (loading) return <p className="loading">Loading...</p>
  if (error) return <p className="error">Error: {error}</p>

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="mb-8 text-4xl font-bold">Rewards</h1>
      <div className="w-full max-w-4xl">
        <h2 className="mb-4 text-2xl font-bold">Buys</h2>
        <ul className="list-inside list-disc">
          {buys.map((buy, index) => (
            <li key={index}>
              From: {buy.from}, To: {buy.to}, Value: {buy.value}
            </li>
          ))}
        </ul>
        <h2 className="mb-4 mt-8 text-2xl font-bold">Sells</h2>
        <ul className="list-inside list-disc">
          {sells.map((sell, index) => (
            <li key={index}>
              From: {sell.from}, To: {sell.to}, Value: {sell.value}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Rewards
