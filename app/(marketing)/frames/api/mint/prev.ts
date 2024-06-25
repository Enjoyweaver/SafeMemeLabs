import { NextApiRequest, NextApiResponse } from "next"

const images = [
  "Hank.jpg",
  "Adele.jpg",
  "Clark Fable.jpg",
  "Cliff.jpg",
  "Destiny.jpg",
  "Dole.jpg",
  "Duck Warhol.jpg",
  "John.jpg",
  "Josephine.jpg",
  "Miss Grace.jpg",
  "Miss Tonya.jpg",
  "Weatherby.jpg",
  "Virgil.jpg",
  "Swirly.jpg",
  "Straw.jpg",
]

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const currentIndex = parseInt(req.cookies.currentIndex || "0")
  const prevIndex = (currentIndex - 1 + images.length) % images.length

  res.setHeader("Set-Cookie", `currentIndex=${prevIndex}; Path=/`)
  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[prevIndex]}`

  res.status(200).json({ imageUrl })
}
