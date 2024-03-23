import { notFound } from "next/navigation"
import { allAuthors, allMembers } from "contentlayer/generated"

import { Mdx } from "@/components/mdx-components"

import "@/styles/mdx.css"
import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { env } from "@/env.mjs"
import { absoluteUrl, cn, formatDate } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Icons } from "@/components/icons"

interface MemberPageProps {
  params: {
    slug: string[]
  }
}

async function getMemberFromParams(params) {
  const slug = params?.slug?.join("/")
  const members = allMembers.find((members) => members.slugAsParams === slug)

  if (!members) {
    null
  }

  return members
}

export async function generateMetadata({
  params,
}: MemberPageProps): Promise<Metadata> {
  const members = await getMemberFromParams(params)

  if (!members) {
    return {}
  }

  const url = env.NEXT_PUBLIC_APP_URL

  const ogUrl = new URL(`${url}/api/og`)
  ogUrl.searchParams.set("heading", members.title)
  ogUrl.searchParams.set("type", "Members")
  ogUrl.searchParams.set("mode", "dark")

  return {
    title: members.title,
    description: members.description,
    authors: members.authors.map((author) => ({
      name: author,
    })),
    openGraph: {
      title: members.title,
      description: members.description,
      type: "article",
      url: absoluteUrl(members.slug),
      images: [
        {
          url: ogUrl.toString(),
          width: 1200,
          height: 630,
          alt: members.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: members.title,
      description: members.description,
      images: [ogUrl.toString()],
    },
  }
}

export async function generateStaticParams(): Promise<
  MemberPageProps["params"][]
> {
  return allMembers.map((members) => ({
    slug: members.slugAsParams.split("/"),
  }))
}

export default async function MemberPage({ params }: MemberPageProps) {
  const members = await getMemberFromParams(params)

  if (!members) {
    notFound()
  }

  const authors = members.authors.map((author) =>
    allAuthors.find(({ slug }) => slug === `/authors/${author}`)
  )

  return (
    <article className="container relative max-w-3xl py-6 lg:py-10">
      <Link
        href="/members"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-[-200px] top-14 hidden xl:inline-flex"
        )}
      >
        <Icons.chevronLeft className="mr-2 h-4 w-4" />
        See all members
      </Link>
      <div>
        {members.date && (
          <time
            dateTime={members.date}
            className="block text-sm text-muted-foreground"
          >
            Member since {formatDate(members.date)}
          </time>
        )}
        <h1 className="quando-regular mt-2 inline-block font-heading text-4xl leading-tight lg:text-5xl">
          {members.title}
        </h1>
        {authors?.length ? (
          <div className="quando-regular mt-4 flex space-x-4">
            {authors.map((author) =>
              author ? (
                <Link
                  key={author._id}
                  href={`https://twitter.com/${author.twitter}`}
                  className="flex items-center space-x-2 text-sm"
                >
                  <Image
                    src={author.avatar}
                    alt={author.title}
                    width={42}
                    height={42}
                    className="rounded-full bg-white"
                  />
                  <div className="quando-regular flex-1 text-left leading-tight">
                    <p className="font-medium">{author.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      @{author.twitter}
                    </p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        ) : null}
      </div>
      <div className="mb-5">
        <div className="mx-auto flex flex-wrap gap-4">
          {members.image && (
            <>
              <div className="max-w-[300px] flex-1 ">
                <Image
                  src={members.image}
                  alt={members.title}
                  layout="responsive"
                  width={300}
                  height={300}
                  className="rounded-md border bg-muted transition-colors"
                  priority
                />
              </div>
              {/* Add two more images here */}
              <div className="max-w-[300px] flex-1 ">
                <Image
                  src="/images/weaver2.jpeg"
                  alt="Second Image"
                  layout="responsive"
                  width={300}
                  height={300}
                  className="rounded-md border bg-muted transition-colors"
                  priority
                />
              </div>
              <div className="max-w-[300px] flex-1 ">
                <Image
                  src="/images/weaver3.jpg"
                  alt="Third Image"
                  layout="responsive"
                  width={300}
                  height={300}
                  className="rounded-md border bg-muted transition-colors"
                  priority
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Mdx code={members.body.code} />
      <hr className="mt-12" />
      <div className="flex justify-center py-6 lg:py-10">
        <Link
          href="/members"
          className={cn(buttonVariants({ variant: "ghost" }))}
        >
          <Icons.chevronLeft className="mr-2 h-4 w-4" />
          See all members
        </Link>
      </div>
    </article>
  )
}
