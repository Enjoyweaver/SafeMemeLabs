import Image from "next/image"
import Link from "next/link"

import { env } from "@/env.mjs"
import { siteConfig } from "@/config/site"
import Sidebar from "@/components/sidebar"

async function getGitHubStars(): Promise<string | null> {
  try {
    const response = await fetch(
      "https://api.github.com/repos/enjoyweaver/safememelabs",
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${env.GITHUB_ACCESS_TOKEN}`,
        },
        next: {
          revalidate: 60,
        },
      }
    )

    if (!response?.ok) {
      return null
    }

    const json = await response.json()

    return parseInt(json["stargazers_count"]).toLocaleString()
  } catch (error) {
    return null
  }
}

export default async function IndexPage() {
  const stars = await getGitHubStars()

  return (
    <>
      <Sidebar />
      <section className="quando-regular lg:py-15 space-y-2 pb-8 pt-2 md:pb-12 md:pt-10">
        <div className="container flex max-w-5xl flex-col items-center gap-4 text-center">
          <div className="relative flex flex-col items-center gap-4">
            <Image
              src="/images/bannerdark.png"
              alt="Banner Light"
              width={500}
              height={200}
              className="light-mode-img"
            />
            <Image
              src="/images/bannerlight.png"
              alt="Banner Dark"
              width={500}
              height={200}
              className="dark-mode-img"
            />
          </div>
          <p className="max-w-2xl leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Building the tools for you to create the safe meme economy
          </p>
        </div>
      </section>
      <section
        id="about"
        className="quando-regular container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-20"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
          <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            About
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            We build the tools for you to create your own safe meme economy.
            From allowing you to create rugproof tokens, funding them through a
            SafeLaunch, creating frames on Warpcast, creating token airdrops,
            and to even creating NFT launches. You'll even be able to create
            your own profile so that you can build your brand and reward your
            followers along the way.
          </p>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            We are blockchain agnostic and will be developing a diverse
            portfolio of tools on various blockchains over time that will be
            listed in the SafeMeme Laboratory as they are created. Our
            guidelines and standards are transparently displayed in the{" "}
            <a href="../docs" className="underline underline-offset-4">
              SafeMeme Laboratory
            </a>{" "}
            and were established so that we can ensure a safe meme economy and
            that you can confidently build without fear of being rugpulled or
            losing your tokens value through any manipulation. As we grow and
            develop over time, so will our guidelines and the tooling that we
            build, though we have a{" "}
            <a href="../blog" className="underline underline-offset-4">
              blog
            </a>{" "}
            and will frequently post our updates there.
          </p>
        </div>
      </section>
      <section
        id="open-source"
        className="quando-regular container py-8 md:py-12 lg:py-2"
      >
        <section id="safememes" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="quando-regular text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              SafeMemes
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              SafeMemes are tokens built using the Vyper programming language
              and an antiwhale limit that each creator determines when they
              create a token. The antiwhale allowance must be greater than 0%
              and equal or less than 3% of the total supply. This is meant to
              limit the possibility of a rugpull, or the impact of a single
              wallet selling their token supply on the rest of the holders,
              which everyone deserves the right to do. However, one individual
              selling all of their tokens shouldnt be such an impact to you
              financially or otherwise. The Vyper programming language was
              chosen for its enhanced smart contract security practices and
              reduced attack-surface providing a strong foundation to safety.
              When you create a token you are able to do anything you want with
              it, except maybe add it to other DEX's though you are absolutely
              welcome to. Though we are just telling you upfront the antiwhale
              percentage could cause issues, otherwise, you are certainly
              welcome to.
            </p>
          </div>
        </section>
        <section id="safelaunch" className=" py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              SafeLaunch
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Not every token that is created here will use the SafeLaunch
              feature, though all have the ability to start a SafeLaunch which
              is a solution to two hurdles in defi - deploying tokens to DEX's
              with antiwhale features or with new features that the DEX's may
              not have have support for, and secondly, deploying a token with
              enough liquidity to make it more likely to succeed. A SafeLaunch
              enables you to earn liquidity for your token by selling 50% of the
              supply over 5 stages. You select what token you want to pair with,
              you set the price, and the SafeLaunch takes care of the rest. 10%
              of the supply will be sold in each stage and all of the tokens
              that are received as payment will be added up over the 5 stages.
              After all of the are sold, all of the paired tokens received and
              the remaining 50% of your tokens supply will be sent to a DEX to
              be permanently listed for sale. This ensures that the tokens are
              secure and rugproof and that anyone can purchase without the fear
              of a rugpull. And as the creator of the tokens, you will receive
              swap fees for all transactions, forever.
            </p>
          </div>
        </section>
        <section id="profile" className=" py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Profile
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              As a creator you deserve a profile that illustrates your talents
              and that you can easily share with others. Your profile page will
              be like your own personal onchain creative laboratory.
            </p>
          </div>
        </section>
        <section id="frames" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Frames
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Soon you will be able to create and launch Frames on Warpcast
              straight from here. We will store the NFTs on Arweave for
              permanent decentralization and mint them on the Base blockchain
              for Farcaster interoperability.
            </p>
          </div>
        </section>
        <section id="nfts" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              NFTs
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Your NFTs are a part of you and you deserve a cool shelf for
              others to see them on. And if someone wants to make an offer on
              one of them, thats cool too.
            </p>
          </div>
        </section>
        <section id="rewards" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Rewards
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              As a creator here you deserve to be rewarded for being a part of
              our growth and helping contribute to the SafeMeme economy, so you
              will be. From giving feedback to our protocol, to being early
              buyers of our own SafeMemes, and to even creating your own brand,
              you deserve to be rewarded for it. And since we are open-source,
              we will solidify these rewards by programming them onchain for all
              to verify, in Vyper of course.
            </p>
          </div>
        </section>
        <section id="airdrop" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Airdrop
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              As you build your brand you will want a way to send your friends,
              family, and followers tokens or NFTs. Whether its to share a cool
              new token, your art, or to just share in your success, you'll be
              able to here. You'll be able to select individual wallets or from
              a list of unique details that allow you to customize your airdrops
              however you need.
            </p>
          </div>
        </section>
        <section id="dashboard" className="container py-8 md:py-12 lg:py-20">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-1 text-center">
            <h2 className="text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Dashboard
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              The dashboard will give an overview of the numbers of creations
              here by everyone. This is to view and analyze what is being
              created, what is being sold, what are the fee's generated, and
              whose getting paid.
            </p>
          </div>
        </section>
        <div className="container relative flex max-w-[40rem] flex-col items-center gap-4">
          <video autoPlay loop muted style={{ borderRadius: "20px" }}>
            <source src="/images/logo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <section id="followers" className="container py-8 md:py-12 lg:py-20">
          <div className="quando-regular mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
            <h2 className=" text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
              Proudly Open Source
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              SafeMeme Labs is completely open-source, meaning all of our code
              is available on{" "}
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4"
              >
                GitHub
              </Link>{" "}
              for you to review.
            </p>

            {stars && (
              <Link
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="flex"
              >
                <div className="flex size-10 items-center justify-center space-x-2 rounded-md border border-muted bg-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="size-5 text-foreground"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                  </svg>
                </div>
                <div className="flex items-center">
                  <div className="size-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent"></div>
                  <div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
                    {stars} stars on GitHub
                  </div>
                </div>
              </Link>
            )}
            <div className="container relative flex max-w-[40rem] flex-col items-center ">
              <Link
                href={siteConfig.links.twitter}
                className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
                target="_blank"
              >
                Follow us on Twitter
              </Link>
            </div>
          </div>
        </section>
      </section>
    </>
  )
}
