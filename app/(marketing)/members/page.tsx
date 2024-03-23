import Image from "next/image"
import Link from "next/link"
import { allMembers } from "contentlayer/generated"
import { compareDesc } from "date-fns"

import { formatDate } from "@/lib/utils"

export const metadata = {
  title: "Members",
}

export default async function Members() {
  const members = allMembers
    .filter((member) => member.published)
    .sort((a, b) => {
      return compareDesc(new Date(a.date), new Date(b.date))
    })

  return (
    <div className="quando-regular container max-w-4xl py-6 lg:py-10">
      <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
        <div className="flex-1 space-y-4">
          <h1 className="quando-regular inline-block text-4xl tracking-tight lg:text-5xl">
            DAO Members
          </h1>
          <p className="text-xl text-muted-foreground">Meet the DAO Members</p>
        </div>
      </div>
      <hr className="my-8" />
      {members?.length ? (
        <div className="flex justify-center">
          <div className="grid gap-20 sm:grid-cols-2">
            {members.map((member, index) => (
              <article
                key={member._id}
                className="group relative flex flex-col space-y-2"
              >
                {member.image && (
                  <Image
                    src={member.image}
                    alt={member.title}
                    width={250}
                    height={250}
                    className="rounded-md border bg-muted transition-colors"
                    priority={index <= 1}
                  />
                )}
                <h2 className="text-2xl font-extrabold">{member.title}</h2>
                {member.description && (
                  <p className="text-muted-foreground">{member.description}</p>
                )}
                {member.date && (
                  <p className="text-sm text-muted-foreground">
                    Member since {formatDate(member.date)}
                  </p>
                )}
                {member.twitter && (
                  <p className="text-sm text-muted-foreground">
                    Twitter: {member.twitter}
                  </p>
                )}
                <Link href={member.slug} className="absolute inset-0">
                  <span className="sr-only">View Article</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      ) : (
        <p>No members published.</p>
      )}
    </div>
  )
}
