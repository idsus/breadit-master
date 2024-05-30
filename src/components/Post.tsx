'use client'

import { formatTimeToNow } from '@/lib/utils'
import { User, Vote } from '@prisma/client'
import type { Post } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef } from 'react'
import { useRouter } from 'next/navigation'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'
import Menu from './Menu' // Importing the new Menu component (kebab/meatball three dots menu)

type PartialVote = Pick<Vote, 'type'>

interface PostProps {
  post: Post & {
    author: User
    votes: Vote[]
  }
  votesAmt: number
  subredditName: string
  currentVote?: PartialVote
  commentAmt: number
}

const Post: FC<PostProps> = ({
  post,
  votesAmt: _votesAmt,
  currentVote: _currentVote,
  subredditName,
  commentAmt,
}) => {
  const pRef = useRef<HTMLParagraphElement>(null)
  const router = useRouter()

  const handleCardClick = () => {
    router.push(`/r/${subredditName}/post/${post.id}`)
  }

  return (
    <div 
      className="rounded-md bg-white shadow hover:bg-gray-50 transition-colors cursor-pointer" 
      onClick={handleCardClick}
    >
      <div className="px-6 py-4 flex justify-between items-start">
        <PostVoteClient
          postId={post.id}
          initialVotesAmt={_votesAmt}
          initialVote={_currentVote?.type}
        />

        <div className="w-0 flex-1">
          <div className="max-h-40 mt-1 text-xs text-gray-500">
            {subredditName ? (
              <>
                <Link
                  className="underline text-zinc-900 text-sm underline-offset-2"
                  href={`/r/${subredditName}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  r/{subredditName}
                </Link>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
            {post.title}
          </h1>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}
          >
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <Menu
            postId={post.id}
            postTitle={post.title}
            postContent={JSON.stringify(post.content)}
          />
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6 flex justify-between">
        <div className="w-fit flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> {commentAmt} comments
        </div>
      </div>
    </div>
  )
}

export default Post
