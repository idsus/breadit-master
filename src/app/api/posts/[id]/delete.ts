import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const id = url.pathname.split('/').pop() // Extracting the ID from the URL

    const post = await db.post.findUnique({
      where: { id },
    })

    if (post?.authorId !== session.user.id) {
      return new Response('Forbidden', { status: 403 })
    }

    await db.post.delete({
      where: { id },
    })

    return new Response('OK')
  } catch (error) {
    return new Response('Could not delete post', { status: 500 })
  }
}
