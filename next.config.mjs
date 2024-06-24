import withMDX from "@next/mdx"
import { withContentlayer } from "next-contentlayer"

import "./env.mjs"

const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  images: {
    domains: ["avatars.githubusercontent.com", "localhost"],
  },
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "script-src 'self' 'unsafe-eval' 'unsafe-inline';",
          },
        ],
      },
    ]
  },
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
