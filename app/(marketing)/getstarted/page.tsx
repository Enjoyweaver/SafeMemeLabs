import * as React from "react"

export default function GetStarted() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-4 text-3xl font-bold">How to Get Started</h1>

      <h2 className="mb-2 mt-6 text-2xl font-semibold">
        Step 1: Create Your Arweave Profile
      </h2>
      <p>
        Start by setting up a profile on the Arweave blockchain, which will act
        as your secure on-chain identity. To get started:
      </p>
      <ul className="ml-6 mt-2 list-disc">
        <li>Create an Arweave wallet.</li>
        <li>Store your seed phrase in a safe place.</li>
        <li>Download your private key file.</li>
      </ul>

      <h2 className="mb-2 mt-6 text-2xl font-semibold">
        Step 2: Customize Your Profile
      </h2>
      <p>Add information to personalize your profile, such as:</p>
      <ul className="ml-6 mt-2 list-disc">
        <li>Banner and profile images</li>
        <li>Handle and display name</li>
        <li>Other information to include in your shareable profile link</li>
      </ul>

      <h2 className="mb-2 mt-6 text-2xl font-semibold">
        Step 3: Create Your SafeMeme
      </h2>
      <p>
        Once your profile is set up, you’re ready to create a SafeMeme token!
        This will involve configuring tokenomics, setting the anti-whale limit,
        and choosing how to launch your token. Follow the prompts to customize
        your token and prepare it for SafeLaunch or other options.
      </p>
    </div>
  )
}
