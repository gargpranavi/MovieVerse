/*
   MovieVerse – useInfiniteScroll.js
   Member 2 | Day 4 — Generic infinite-scroll pagination hook.

   This hook is the shared core used by both the Movies page and the
   TV Series page. It accepts a map of { categoryKey → fetchFn } so
   each page can define its own categories without duplicating any logic.

   Design goals (same as Day 3 useInfiniteMovies):
   ─────────────────────────────────────────────────
   • Single active request guard (loadingRef) — prevents concurrent fetches
     from rapid IntersectionObserver callbacks or React StrictMode double-invokes.
   • AbortController cancels in-flight requests when the category changes
     or the component unmounts, preventing stale state updates.
   • fetchedPages Set tracks already-requested pages to ensure idempotency.
   • seenIds Set deduplicates items across pages.
   • Category change → full state reset (page counter, accumulated list, flags).
   • Fallback data: if the API is unavailable the local fallback is served once;
     hasMore is immediately set false so no further requests are attempted.
   • Never throws — all errors are surfaced as { error } state.
   • retry() re-attempts the last failed page without resetting loaded items.

   Returns
   ───────
   {
     items       : NormalisedShow[]  – accumulated list across all pages
     loading     : boolean
     initialLoad : boolean           – true until the very first page resolves
     error       : string|null
     hasMore     : boolean
     isFallback  : boolean
     loadMore    : () => void
     retry       : () => void
     totalPages  : number|null
     currentPage : number
   }
*/

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic infinite-scroll pagination hook.
 *
 * @param {Object.<string, Function>} fetchFnMap
 *   Map of { categoryKey: fetchFn(page) → Promise<ApiResult> }
 * @param {string} category
 *   Active category key — must exist as a key in fetchFnMap.
 * @param {Function} [fallbackFetchFn]
 *   Optional fallback fetch function if category is not in the map.
 */
export function useInfiniteScroll(fetchFnMap, category, fallbackFetchFn) {
  const [items,       setItems]       = useState([])
  const [loading,     setLoading]     = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error,       setError]       = useState(null)
  const [hasMore,     setHasMore]     = useState(true)
  const [isFallback,  setIsFallback]  = useState(false)
  const [totalPages,  setTotalPages]  = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Internal refs — survive renders without causing re-renders themselves
  const loadingRef   = useRef(false)
  const fetchedPages = useRef(new Set())
  const seenIds      = useRef(new Set())
  const abortRef     = useRef(null)
  const categoryRef  = useRef(category)

  /** Resolve fetch function for the current category */
  function getFetchFn(cat) {
    return fetchFnMap[cat] ?? fallbackFetchFn ?? Object.values(fetchFnMap)[0]
  }

  // ── Reset when category changes ─────────────────────────────────────────────
  useEffect(() => {
    abortRef.current?.abort()
    categoryRef.current = category

    setItems([])
    setLoading(false)
    setInitialLoad(true)
    setError(null)
    setHasMore(true)
    setIsFallback(false)
    setTotalPages(null)
    setCurrentPage(0)

    loadingRef.current = false
    fetchedPages.current.clear()
    seenIds.current.clear()
  }, [category]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core fetch ──────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page, cat) => {
    const key = `${cat}:${page}`

    if (fetchedPages.current.has(key)) return
    if (loadingRef.current) return

    loadingRef.current = true
    fetchedPages.current.add(key)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    let result
    try {
      result = await getFetchFn(cat)(page)
    } catch (err) {
      if (controller.signal.aborted) {
        loadingRef.current = false
        return
      }
      result = {
        success: false, isFallback: false,
        data: [], error: err?.message ?? 'Unexpected error',
        page, totalPages: null,
      }
    }

    // Stale-check: category changed while this request was in-flight
    if (categoryRef.current !== cat || controller.signal.aborted) {
      loadingRef.current = false
      return
    }

    // ── Fallback: serve local data once, stop pagination ────────────────────
    if (result.isFallback) {
      const fresh = (result.data ?? []).filter(m => !seenIds.current.has(m.id))
      fresh.forEach(m => seenIds.current.add(m.id))
      setItems(prev => [...prev, ...fresh])
      setIsFallback(true)
      setHasMore(false)
      setTotalPages(1)
      setCurrentPage(1)
      setError(null)
      setLoading(false)
      setInitialLoad(false)
      loadingRef.current = false
      return
    }

    // ── Error (non-fallback) ─────────────────────────────────────────────────
    if (!result.success) {
      fetchedPages.current.delete(key)   // allow retry
      setError(result.error ?? 'Failed to load content')
      setLoading(false)
      setInitialLoad(false)
      loadingRef.current = false
      return
    }

    // ── Success ─────────────────────────────────────────────────────────────
    const incoming = result.data ?? []
    const tp       = result.totalPages ?? null

    const fresh = incoming.filter(m => !seenIds.current.has(m.id))
    fresh.forEach(m => seenIds.current.add(m.id))

    setItems(prev => [...prev, ...fresh])
    setTotalPages(tp)
    setCurrentPage(page)
    setHasMore(tp !== null ? page < tp : false)
    setIsFallback(false)
    setError(null)
    setLoading(false)
    setInitialLoad(false)
    loadingRef.current = false
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-fetch page 1 on mount / after category reset ───────────────────────
  useEffect(() => {
    if (currentPage === 0 && !loadingRef.current) {
      fetchPage(1, category)
    }
  }, [currentPage, category, fetchPage])

  // ── Public loadMore ──────────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    // loadingRef is the single-flight guard — don't also block on initialLoad
    // because after page-1 finishes, initialLoad=false and the sentinel may
    // already be intersecting (never scrolled away), so we'd never get page 2.
    if (loadingRef.current || !hasMore) return
    const next = currentPage + 1
    if (totalPages !== null && next > totalPages) return
    fetchPage(next, categoryRef.current)
  }, [hasMore, currentPage, totalPages, fetchPage])

  // ── Public retry ─────────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    if (loadingRef.current) return
    const failedPage = currentPage + 1
    fetchPage(failedPage, categoryRef.current)
  }, [currentPage, fetchPage])

  // ── Cleanup on unmount ───────────────────────────────────────────────────────
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  return {
    items, loading, initialLoad, error,
    hasMore, isFallback, totalPages, currentPage,
    loadMore, retry,
  }
}
