import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { PostValidator } from '@/lib/validators/post'
import { z } from 'zod'

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json()
    const { title, content } = PostValidator.parse(body)
    const url = new URL(req.url)
    const id = url.pathname.split('/').pop() // Extracting the ID from the URL

    const post = await db.post.findUnique({
      where: { id },
    })

    if (post?.authorId !== session.user.id) {
      return new Response('Forbidden', { status: 403 })
    }

    await db.post.update({
      where: { id },
      data: { title, content },
    })

    return new Response('OK')
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 })
    }
    return new Response('Could not update post', { status: 500 })
  }
}
