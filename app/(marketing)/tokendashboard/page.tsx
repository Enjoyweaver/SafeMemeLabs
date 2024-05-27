import React from "react"

import "@/styles/dashboard.css"
import TokenHoldersList from "@/components/tokenholderslist"

const Dashboard = () => {
  const shouldShowLogin = false
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="dashboard">
          <section>
            <h2>Memes we created on our competitors' websites</h2>
            <div className="meme">
              <h3>Safememe</h3>
              <TokenHoldersList
                walletAddress="0x14E3C9107b16AF020E4F2B5971CC19C6DFc8F15B"
                chainName="fantom-mainnet"
              />
            </div>
            <div className="meme">
              <h3>Bubbles</h3>
              <TokenHoldersList
                walletAddress="0x54B051d102c19c1Cc12a391b0eefCD7eeb64CeDA"
                chainName="fantom-mainnet"
              />
            </div>
          </section>

          <section>
            <h2>Memes you created using SafeMemes</h2>
            <ul>
              {/* Placeholder for future Covalent API data */}
              <li>Example Meme 1</li>
              <li>Example Meme 2</li>
            </ul>
          </section>

          <section>
            <h2>Memes we created using our tech stack</h2>
            <ul>
              {/* Placeholder for future tech stack memes */}
              <li>Example Tech Meme 1</li>
              <li>Example Tech Meme 2</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
