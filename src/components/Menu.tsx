'use client'

import { FC, useState, useEffect } from 'react'
import { MoreVertical, Trash2, Edit3 } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

interface MenuProps {
  postId: string
  postTitle: string
  postContent: string
}

const Menu: FC<MenuProps> = ({ postId, postTitle, postContent }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(postTitle)
  const [content, setContent] = useState<string>(JSON.stringify(postContent) || '')
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
      await axios.patch(`/api/subreddit/post/${postId}/edit`, { title, content })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update post:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/subreddit/post/${postId}/delete`)
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
          <button
            onClick={() => setIsEditing(true)}
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
      )}
    </div>
  )
}

export default Menu
