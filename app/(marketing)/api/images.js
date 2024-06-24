import { promises as fs } from "fs"
import path from "path"

export default async function handler(req, res) {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images", "luckyducks")
    const filenames = await fs.readdir(imagesDir)
    const images = filenames.map((name) => `/images/luckyducks/${name}`)
    res.status(200).json(images)
  } catch (error) {
    console.error("Error reading image directory:", error)
    res.status(500).json({ error: "Error reading image directory" })
  }
}
