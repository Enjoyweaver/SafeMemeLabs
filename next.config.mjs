import withMDX from "@next/mdx"
import { withContentlayer } from "next-contentlayer"

import "./env.mjs"

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com"],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(mp4)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next",
          outputPath: "static/images/",
          name: "[name].[hash].[ext]",
          esModule: false,
        },
      },
    })

    return config
  },
}

export default withContentlayer(withMDX()(nextConfig))
