import { FrameMetadataType, getFrameHtmlResponse } from "@coinbase/onchainkit"

import { ARWEAVE_IMAGE_URL } from "./config"

export function getFrameHtml(frameMetadata: FrameMetadataType) {
  const html = getFrameHtmlResponse(frameMetadata)

  const extraTags = [
    '<meta property="og:title" content="SafeMeme: Mint Your NFT">',
    '<meta property="og:description" content="Mint one of the 777 unique NFTs with SafeMeme.">',
    `<meta property="og:image" content="${ARWEAVE_IMAGE_URL}">`,
    '<meta property="fc:frame:image:aspect_ratio" content="1:1" />',
  ]
  // Remove closing tags, add extra tags, and close HTML document
  return `${html.slice(0, html.length - 14)}${extraTags.join("")}</head></html>`
}
