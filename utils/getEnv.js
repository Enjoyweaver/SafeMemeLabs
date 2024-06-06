// utils/getEnv.js
export const getEnv = (key, fallback = null) => {
  return process.env[key] || fallback
}
