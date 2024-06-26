import { NextRequest, NextResponse } from "next/server"
import { MintABI } from "@/ABIs/frame/NFTmint"
import { createClient } from "@supabase/supabase-js"
import { ethers } from "ethers"

// Ensure environment variables are defined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

const getRandomImage = async (): Promise<string> => {
  const { data, error } = await supabase
    .from("minted_images")
    .select("image_url")
    .eq("minted", false)

  if (error) {
    throw new Error("Error fetching images from Supabase")
  }

  if (data.length === 0) {
    throw new Error("All images have been minted")
  }

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex].image_url
}

const markImageAsMinted = async (imageUrl: string) => {
  const { error } = await supabase
    .from("minted_images")
    .update({ minted: true })
    .eq("image_url", imageUrl)

  if (error) {
    throw new Error("Error updating image status in Supabase")
  }
}

const mintNFT = async (imageUrl: string, userAddress: string) => {
  const rpcUrl = process.env.RPC_URL
  const privateKey = process.env.PRIVATE_KEY
  const contractAddress = process.env.CONTRACT_ADDRESS

  if (!rpcUrl || !privateKey || !contractAddress) {
    throw new Error("Missing environment variables")
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  const wallet = new ethers.Wallet(privateKey, provider)
  const contract = new ethers.Contract(contractAddress, MintABI, wallet)

  const tx = await contract.mintNFT(userAddress, imageUrl)
  await tx.wait()
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let userAddress = req.headers.get("x-user-address")

  if (!userAddress) {
    return NextResponse.json(
      { error: "User address is required" },
      { status: 400 }
    )
  }

  try {
    const imageUrl = await getRandomImage()

    await mintNFT(imageUrl, userAddress)

    await markImageAsMinted(imageUrl)

    return NextResponse.json({ success: true, imageUrl })
  } catch (error) {
    console.error("Minting error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
