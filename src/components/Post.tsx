'use client'

import { formatTimeToNow } from '@/lib/utils'
import { User, Vote } from '@prisma/client'
import type { Post } from '@prisma/client'
import { MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { FC, useRef, useState, useEffect } from 'react'
import EditorOutput from './EditorOutput'
import PostVoteClient from './post-vote/PostVoteClient'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { MoreVertical, Trash2, Edit3 } from 'lucide-react' // Importing icons

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
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState<string>(
    JSON.stringify(post.content) || ''
  )
  const [showMenu, setShowMenu] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (showMenu) {
      const hideMenu = () => setShowMenu(false)
      document.addEventListener('click', hideMenu)
      return () => document.removeEventListener('click', hideMenu)
    }
  }, [showMenu])

  const handleEdit = async () => {
    try {
      await axios.patch(`/api/posts/${post.id}/edit`, { title, content })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/posts/${post.id}/delete`)
      router.push('/')
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-md bg-white shadow">
        <div className="px-6 py-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded border-gray-300"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full mt-2 rounded border-gray-300"
          />
          <div className="flex justify-end space-x-2 mt-2">
            <button onClick={handleEdit} className="text-blue-500">
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-white shadow">
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
                <a
                  className="underline text-zinc-900 text-sm underline-offset-2"
                  href={`/r/${subredditName}`}>
                  r/{subredditName}
                </a>
                <span className="px-1">•</span>
              </>
            ) : null}
            <span>Posted by u/{post.author.username}</span>{' '}
            {formatTimeToNow(new Date(post.createdAt))}
          </div>
          <a href={`/r/${subredditName}/post/${post.id}`}>
            <h1 className="text-lg font-semibold py-2 leading-6 text-gray-900">
              {post.title}
            </h1>
          </a>

          <div
            className="relative text-sm max-h-40 w-full overflow-clip"
            ref={pRef}>
            <EditorOutput content={post.content} />
            {pRef.current?.clientHeight === 160 ? (
              // blur bottom if content is too long
              <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent"></div>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700"
            aria-expanded={showMenu}
            aria-haspopup="true">
            <MoreVertical />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20"
              onClick={(e) => e.stopPropagation()}>
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative">
                <button
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  aria-expanded={showMenu}>
                  <Edit3 className="mr-2 h-4 w-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-50 z-20 text-sm px-4 py-4 sm:px-6 flex justify-between">
        <Link
          href={`/r/${subredditName}/post/${post.id}`}
          className="w-fit flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> {commentAmt} comments
        </Link>
      </div>
    </div>
  )
}

export default Post
