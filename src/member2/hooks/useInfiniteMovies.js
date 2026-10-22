/*
   MovieVerse – useInfiniteMovies.js
   Member 2 | Custom hook for infinite-scroll movie loading.

   Design goals
   ────────────
   • Single active request guard (loadingRef) prevents duplicate fetches from
     rapid IntersectionObserver callbacks or React StrictMode double-invokes.
   • AbortController signals cancel in-flight requests when category changes
     or the component unmounts, preventing stale state updates.
   • fetchedPages Set tracks which pages were already requested to avoid
     re-requesting the same page after fast repeated observer fires.
   • seenIds Set deduplicates movies by stable tmdb-{id} across all pages.
   • Category change → full reset (page counter, accumulated list, end flag).
   • Fallback data: if TMDB is unavailable the local fallback is served once;
     hasMore is immediately set false so no further requests are attempted.
   • Never throws — all errors are surfaced as { error } state.
   • retry() re-attempts the last failed page without resetting loaded pages.

   Returns
   ───────
   {
     movies      : NormalisedShow[]   – accumulated list across pages
     loading     : boolean            – true while a fetch is in-flight
     initialLoad : boolean            – true until the very first page resolves
     error       : string|null        – last page-level error (loaded list preserved)
     hasMore     : boolean            – false when all TMDB pages are consumed
     isFallback  : boolean            – true when using local data
     loadMore    : () => void         – call to load next page (no-op if busy/done)
     retry       : () => void         – retry the last failed page
     totalPages  : number|null
     currentPage : number
   }
*/

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchNowPlayingMovies,
} from '../services/tmdbApi.js'

// ── Category → fetch function map ───────────────────────────────────────────
const FETCH_FN_MAP = {
  popular:     fetchPopularMovies,
  top_rated:   fetchTopRatedMovies,
  upcoming:    fetchUpcomingMovies,
  now_playing: fetchNowPlayingMovies,
}

function getFetchFn(category) {
  return FETCH_FN_MAP[category] ?? fetchPopularMovies
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Infinite-scroll hook for the Movies page.
 *
 * @param {string} category – 'popular' | 'top_rated' | 'upcoming' | 'now_playing'
 */
export function useInfiniteMovies(category = 'popular') {
  const [movies,      setMovies]      = useState([])
  const [loading,     setLoading]     = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error,       setError]       = useState(null)
  const [hasMore,     setHasMore]     = useState(true)
  const [isFallback,  setIsFallback]  = useState(false)
  const [totalPages,  setTotalPages]  = useState(null)
  const [currentPage, setCurrentPage] = useState(0)

  // Single-flight guard – prevents concurrent fetches
  const loadingRef   = useRef(false)
  // Pages already requested for the current category
  const fetchedPages = useRef(new Set())
  // IDs already in the accumulated list
  const seenIds      = useRef(new Set())
  // Abort controller for the latest in-flight fetch
  const abortRef     = useRef(null)
  // Stable ref to the latest category so async callbacks can detect staleness
  const categoryRef  = useRef(category)

  // ── Reset when category changes ───────────────────────────────────────────
  useEffect(() => {
    abortRef.current?.abort()
    categoryRef.current = category

    setMovies([])
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
  }, [category])

  // ── Core fetch ────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (page, cat) => {
    const key = `${cat}:${page}`

    // Idempotency: skip already-fetched pages
    if (fetchedPages.current.has(key)) return
    // Guard: skip if a fetch is already in flight
    if (loadingRef.current) return

    loadingRef.current = true
    fetchedPages.current.add(key)

    // Cancel any previous in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    let result
    try {
      result = await getFetchFn(cat)(page)
    } catch (err) {
      // Should not reach here (tmdbApi never throws), but guard anyway
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

    // Stale-check: category changed while this request was in flight
    if (categoryRef.current !== cat || controller.signal.aborted) {
      loadingRef.current = false
      return
    }

    // ── Fallback: serve local data once, stop pagination ─────────────────
    if (result.isFallback) {
      const fresh = (result.data ?? []).filter(m => !seenIds.current.has(m.id))
      fresh.forEach(m => seenIds.current.add(m.id))
      setMovies(prev => [...prev, ...fresh])
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

    // ── Error (non-fallback) ─────────────────────────────────────────────
    if (!result.success) {
      // Remove from fetchedPages so retry() can try again
      fetchedPages.current.delete(key)
      setError(result.error ?? 'Failed to load movies')
      setLoading(false)
      setInitialLoad(false)
      loadingRef.current = false
      return
    }

    // ── Success ──────────────────────────────────────────────────────────
    const incoming = result.data ?? []
    const tp       = result.totalPages ?? null

    const fresh = incoming.filter(m => !seenIds.current.has(m.id))
    fresh.forEach(m => seenIds.current.add(m.id))

    setMovies(prev => [...prev, ...fresh])
    setTotalPages(tp)
    setCurrentPage(page)
    setHasMore(tp !== null ? page < tp : false)
    setIsFallback(false)
    setError(null)
    setLoading(false)
    setInitialLoad(false)
    loadingRef.current = false
  }, [])

  // ── Auto-fetch page 1 on mount / category reset ───────────────────────────
  useEffect(() => {
    if (currentPage === 0 && !loadingRef.current) {
      fetchPage(1, category)
    }
  }, [currentPage, category, fetchPage])

  // ── Public loadMore ───────────────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore || initialLoad) return
    const next = currentPage + 1
    if (totalPages !== null && next > totalPages) return
    fetchPage(next, categoryRef.current)
  }, [hasMore, initialLoad, currentPage, totalPages, fetchPage])

  // ── Public retry ──────────────────────────────────────────────────────────
  const retry = useCallback(() => {
    if (loadingRef.current) return
    // Page after currentPage is the one that failed (it was removed from fetchedPages)
    const failedPage = currentPage + 1
    fetchPage(failedPage, categoryRef.current)
  }, [currentPage, fetchPage])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => { abortRef.current?.abort() }
  }, [])

  return {
    movies, loading, initialLoad, error,
    hasMore, isFallback, totalPages, currentPage,
    loadMore, retry,
  }
}
