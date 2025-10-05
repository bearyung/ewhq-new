import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface BookmarkItem {
  path: string
  label: string
  icon?: string
}

interface BookmarkContextType {
  bookmarks: BookmarkItem[]
  addBookmark: (item: BookmarkItem) => void
  removeBookmark: (path: string) => void
  isBookmarked: (path: string) => boolean
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined)

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('userBookmarks')
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks))
      } catch (error) {
        console.error('Failed to parse bookmarks from localStorage:', error)
      }
    }
  }, [])

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('userBookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  const addBookmark = (item: BookmarkItem) => {
    setBookmarks(prev => {
      // Check if bookmark already exists
      if (prev.some(b => b.path === item.path)) {
        return prev
      }
      return [...prev, item]
    })
  }

  const removeBookmark = (path: string) => {
    setBookmarks(prev => prev.filter(b => b.path !== path))
  }

  const isBookmarked = (path: string) => {
    return bookmarks.some(b => b.path === path)
  }

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBookmarks() {
  const context = useContext(BookmarkContext)
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider')
  }
  return context
}
