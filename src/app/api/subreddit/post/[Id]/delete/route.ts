import { getAuthSession } from '@/lib/auth'
import { db } from '@/lib/db'
import { redis } from '@/lib/redis'
import axios from 'axios'

export async function DELETE(req: Request) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const url = new URL(req.url)
    const pathname = url.pathname
    const pathSegments = pathname.split('/')
    const postId = pathSegments[pathSegments.length - 1] // Extracting the ID from the URL

    const post = await db.post.findUnique({
      where: { id: postId },
    })

    if (post?.authorId !== session.user.id) {
      return new Response('Forbidden', { status: 403 })
    }

    // Parse post content to extract image URL
    let imageUrl: string | null = null
    if (post?.content) {
      const postContent = JSON.parse(post.content as string)
      if (postContent && postContent.blocks) {
        for (const block of postContent.blocks) {
          if (block.type === 'image' && block.data && block.data.file && block.data.file.url) {
            imageUrl = block.data.file.url
            break
          }
        }
      }
    }

    // Delete the post from the database
    await db.post.delete({
      where: { id: postId },
    })

    // Delete the image from UploadThing if it exists
    if (imageUrl) {
      try {
        await axios.delete(`https://api.uploadthing.com/v1/files/${imageUrl}`, {
          headers: {
            'Authorization': `Bearer ${process.env.UPLOADTHING_SECRET}`,
          },
        })
      } catch (error) {
        console.error('Error deleting image from UploadThing:', error)
      }
    }

    // Remove post data from Redis cache
    await redis.del(`post:${postId}`)

    return new Response('OK')
  } catch (error) {
    console.error('Error deleting post:', error)
    return new Response('Could not delete post', { status: 500 })
  }
}
