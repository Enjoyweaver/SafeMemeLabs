import { NextApiRequest, NextApiResponse } from "next"

let currentIndex = 0 // Temporary storage, should be managed properly in a real scenario

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  currentIndex = (currentIndex - 1 + images.length) % images.length
  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/images/luckyducks/${images[currentIndex]}`

  res.status(200).json({ imageUrl })
}
