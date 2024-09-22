// cryptoUtils.ts

// Function to generate a random salt
export const generateSalt = (): string => {
  const array = new Uint8Array(16)
  window.crypto.getRandomValues(array)
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Function to derive a key from a password and salt using PBKDF2
export const deriveKey = async (
  password: string,
  salt: string
): Promise<CryptoKey> => {
  const encoder = new TextEncoder()
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  )

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: hexStringToArrayBuffer(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  )
}

// Function to encrypt data using AES-GCM
export const encryptData = async (
  data: any,
  key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> => {
  const encoder = new TextEncoder()
  const iv = window.crypto.getRandomValues(new Uint8Array(12)) // AES-GCM recommended IV size is 12 bytes
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoder.encode(JSON.stringify(data))
  )
  return {
    ciphertext: arrayBufferToHexString(encrypted),
    iv: arrayBufferToHexString(iv.buffer),
  }
}

// Function to decrypt data using AES-GCM
export const decryptData = async (
  ciphertext: string,
  key: CryptoKey,
  iv: string
): Promise<any> => {
  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: hexStringToArrayBuffer(iv),
    },
    key,
    hexStringToArrayBuffer(ciphertext)
  )
  const decoder = new TextDecoder()
  return JSON.parse(decoder.decode(decrypted))
}

// Helper functions to convert between hex strings and ArrayBuffers
export const hexStringToArrayBuffer = (hex: string): ArrayBuffer => {
  if (hex.length % 2 !== 0) throw new Error("Invalid hex string")
  const buffer = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    buffer[i / 2] = parseInt(hex.substr(i, 2), 16)
  }
  return buffer.buffer
}

export const arrayBufferToHexString = (buffer: ArrayBuffer): string => {
  const byteArray = new Uint8Array(buffer)
  const hexString = Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
  return hexString
}
