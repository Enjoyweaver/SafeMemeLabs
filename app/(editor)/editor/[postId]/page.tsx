import { notFound, redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Post, User } from "@prisma/client"

import { db } from "@/lib/db"
import { Editor } from "@/components/editor"

async function getPostForUser(postId: Post["id"], userId: User["id"]) {
  return await db.post.findFirst({
    where: {
      id: postId,
      authorId: userId,
    },
  })
}

interface EditorPageProps {
  params: { postId: string }
}

export default async function EditorPage({ params }: EditorPageProps) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getUser()

  if (!Post) {
    notFound()
  }

  return (
    <Editor
      post={{
        id: Post.id,
        title: Post.title,
        content: Post.content,
        published: Post.published,
      }}
    />
  )
}
