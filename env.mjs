// import { createEnv } from "@t3-oss/env-nextjs"
// import { z } from "zod"

// export const env = createEnv({
//   server: {
//     // This is optional because it's only used in development.
//     // See https://next-auth.js.org/deployment.
//     GITHUB_CLIENT_ID: z.string().min(1),
//     GITHUB_CLIENT_SECRET: z.string().min(1),
//     GITHUB_ACCESS_TOKEN: z.string().min(1),

//     STRIPE_API_KEY: z.string().min(1),
//     STRIPE_WEBHOOK_SECRET: z.string().min(1),
//     STRIPE_PRO_MONTHLY_PLAN_ID: z.string().min(1),
//   },
//   client: {
//     NEXT_PUBLIC_APP_URL: z.string().min(1),
//   },
//   runtimeEnv: {
//     GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
//     GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
//     GITHUB_ACCESS_TOKEN: process.env.GITHUB_ACCESS_TOKEN,

//     STRIPE_API_KEY: process.env.STRIPE_API_KEY,
//     STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
//     STRIPE_PRO_MONTHLY_PLAN_ID: process.env.STRIPE_PRO_MONTHLY_PLAN_ID,
//     NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
//   },
// })
