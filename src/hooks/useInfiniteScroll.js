// src/hooks/useInfiniteScroll.js
import { useState, useEffect, useCallback, useRef } from 'react'

export const useInfiniteScroll = (items, itemsPerPage = 12) => {
  const [displayedItems, setDisplayedItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const observerRef = useRef(null)

  // Reset when items change
  useEffect(() => {
    setPage(1)
    setDisplayedItems(items.slice(0, itemsPerPage))
    setHasMore(items.length > itemsPerPage)
  }, [items, itemsPerPage])

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return

    setLoading(true)

    // Simulate network delay
    setTimeout(() => {
      const nextPage = page + 1
      const start = 0
      const end = nextPage * itemsPerPage
      const newItems = items.slice(start, end)

      setDisplayedItems(newItems)
      setPage(nextPage)
      setHasMore(end < items.length)
      setLoading(false)
    }, 300)
  }, [items, page, itemsPerPage, loading, hasMore])

  // Intersection Observer for auto-loading
  const lastItemRef = useCallback((node) => {
    if (loading) return

    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })

    if (node) {
      observerRef.current.observe(node)
    }
  }, [loading, hasMore, loadMore])

  return {
    displayedItems,
    loading,
    hasMore,
    loadMore,
    lastItemRef,
    total: items.length,
    displayed: displayedItems.length,
  }
}