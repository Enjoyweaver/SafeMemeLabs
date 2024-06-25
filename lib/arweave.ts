import axios from "axios"

import { ARWEAVE_API_URL } from "./config"

export async function uploadImageToArweave(imageFile: File): Promise<string> {
  const formData = new FormData()
  formData.append("file", imageFile)

  const response = await axios.post(`${ARWEAVE_API_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  if (response.status !== 200) {
    throw new Error("Failed to upload image to Arweave")
  }

  return response.data.transaction.id
}
