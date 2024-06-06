import ChainlinkDatastreamsConsumer from "@hackbg/chainlink-datastreams-consumer"

import { getEnv } from "../utils/getEnv"

// Adjust the path according to your project structure

export const api = new ChainlinkDatastreamsConsumer({
  hostname: getEnv("CHAINLINK_API_URL", "default-api-url"),
  wsHostname: getEnv("CHAINLINK_WEBSOCKET_URL", "default-ws-url"),
  clientID: getEnv("CHAINLINK_CLIENT_ID", "default-client-id"),
  clientSecret: getEnv("CHAINLINK_CLIENT_SECRET", "default-client-secret"),
})
