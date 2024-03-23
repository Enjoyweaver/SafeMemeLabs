import Link from "next/link"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

export const metadata = {
  title: "Support",
}

export default function PricingPage() {
  return (
    <section className="quando-regular container flex flex-col  gap-6 py-8 md:max-w-[64rem] md:py-12 lg:py-24">
      <div className="mx-auto flex w-full flex-col gap-4 md:max-w-[58rem]">
        <h2 className=" text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
          Support clear, concise, and collaborative web3-friendly regulation
        </h2>
        <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
          Your financial contributions empower us to lobby for web3 friendly
          regulation.
        </p>
      </div>
      <div className="grid w-full items-start gap-10 rounded-lg border p-10 md:grid-cols-[1fr_200px]">
        <div className="grid gap-6">
          <h3 className="text-xl font-bold sm:text-2xl">
            What&apos;s included in your monthly financial support:
          </h3>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> DAO membership
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Discord Access
            </li>

            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Invite only events
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Newsletter
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Membership NFT
            </li>
            <li className="flex items-center">
              <Icons.check className="mr-2 h-4 w-4" /> Direct web3 support
              provider
            </li>
          </ul>
        </div>
        <div className="flex flex-col gap-4 text-center">
          <div>
            <h4 className="text-5xl ">$10</h4>
            <p className="text-sm font-medium text-muted-foreground">
              Monthly Support
            </p>
          </div>
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }))}>
            Get Started
          </Link>
        </div>
      </div>
    </section>
  )
}
