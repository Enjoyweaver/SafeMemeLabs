import axios from "axios"

import {
  ARWEAVE_API_URL,
  ARWEAVE_IMAGE_URL,
  NEXT_PUBLIC_URL,
  TOKEN_IMAGE,
} from "../config"

// Function to get collection metadata from Arweave
export async function getCollection() {
  try {
    const response = await axios.get(`${ARWEAVE_API_URL}/tx/<transaction_id>`) // Replace <transaction_id> with the actual Arweave transaction ID
    const metadata = response.data

    const name = metadata.name ?? "Unknown Collection"
    const image = metadata.image ?? TOKEN_IMAGE

    return { name, image, address: ARWEAVE_IMAGE_URL, tokenId: "<TOKEN_ID>" } // Replace <TOKEN_ID> with the actual token ID
  } catch (error) {
    console.error("Error fetching collection from Arweave:", error)
    return {
      name: "Unknown Collection",
      image: TOKEN_IMAGE,
      address: ARWEAVE_IMAGE_URL,
      tokenId: "<TOKEN_ID>",
    } // Replace <TOKEN_ID> with the actual token ID
  }
}
