import { NextResponse } from "next/server"

import { ARWEAVE_IMAGE_URL } from "./config"
import { getFrameHtml } from "./getFrameHtml"

export function errorResponse() {
  return new NextResponse(
    getFrameHtml({
      image: `${ARWEAVE_IMAGE_URL}/error`,
    })
  )
}

export async function mintResponse() {
  return new NextResponse(
    getFrameHtml({
      buttons: [
        {
          label: "Mint",
          action: "mint",
          target: `eip155:8453:<YOUR_CONTRACT_ADDRESS>:<TOKEN_ID>`,
        },
      ],
      image: `${ARWEAVE_IMAGE_URL}/inactive`,
    })
  )
}
