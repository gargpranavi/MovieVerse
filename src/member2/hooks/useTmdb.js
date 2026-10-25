/*
   MovieVerse – useTmdb.js
   Member 2 | Custom React hook for TMDB data fetching

   Wraps tmdbApi.js functions to provide:
   - loading, error and data states
   - automatic re-fetch when parameters change
   - isFallback flag for UI to show a banner when using local data
   - manual refresh capability
   - no dependency beyond React and the internal service

   Usage examples:

     // Trending
     const { data, loading, error, isFallback } = useTmdb(fetchTrending, ['all', 'week', 1])

     // Popular movies page 2
     const { data, loading } = useTmdb(fetchPopularMovies, [2])

     // Movie details (pass null to skip the call)
     const { data } = useTmdb(fetchMovieDetails, tmdbId ? [tmdbId] : null)
*/

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic TMDB data-fetching hook.
 *
 * @param {Function}      fetchFn   - One of the exported tmdbApi functions
 * @param {Array|null}    args      - Arguments to pass to fetchFn. Pass null to skip.
 * @param {object}        [options]
 * @param {boolean}       [options.immediate=true]  - Fetch on mount (false = lazy)
 * @returns {{
 *   data:        Array,
 *   loading:     boolean,
 *   error:       string|null,
 *   isFallback:  boolean,
 *   source:      string,
 *   page:        number|null,
 *   totalPages:  number|null,
 *   refresh:     Function,
 * }}
 */
export function useTmdb(fetchFn, args, { immediate = true } = {}) {
  const [data,        setData]        = useState([])
  const [loading,     setLoading]     = useState(immediate && args !== null)
  const [error,       setError]       = useState(null)
  const [isFallback,  setIsFallback]  = useState(false)
  const [source,      setSource]      = useState(null)
  const [page,        setPage]        = useState(null)
  const [totalPages,  setTotalPages]  = useState(null)

  // Track latest args to cancel stale responses after fast param changes
  const argsRef = useRef(args)

  const execute = useCallback(async (callArgs) => {
    if (!fetchFn || callArgs === null) return

    setLoading(true)
    setError(null)

    argsRef.current = callArgs

    const result = await fetchFn(...callArgs)

    // Discard if a newer call already updated argsRef
    if (argsRef.current !== callArgs) return

    setData(result.data ?? [])
    setIsFallback(result.isFallback ?? false)
    setSource(result.source ?? null)
    setPage(result.page ?? null)
    setTotalPages(result.totalPages ?? null)

    if (!result.success && !result.isFallback) {
      setError(result.error ?? 'Unknown error')
    } else {
      setError(null)
    }

    setLoading(false)
  }, [fetchFn]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!immediate || args === null) {
      setLoading(false)
      return
    }
    execute(args)
    // Serialise args for dep comparison - keeps effect stable for primitive arrays
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute, JSON.stringify(args)])

  const refresh = useCallback(() => {
    if (args !== null) execute(args)
  }, [execute, args])

  return { data, loading, error, isFallback, source, page, totalPages, refresh }
}

/**
 * Convenience hook: accumulates results across pages (for infinite scroll prep).
 * Appends each page's data to the existing list instead of replacing it.
 *
 * @param {Function} fetchFn      - fetchPopularMovies | fetchPopularTvShows | fetchTrending
 * @param {number}   initialPage
 * @returns {{
 *   data:         Array,
 *   loading:      boolean,
 *   error:        string|null,
 *   isFallback:   boolean,
 *   currentPage:  number,
 *   totalPages:   number|null,
 *   hasMore:      boolean,
 *   loadNextPage: Function,
 *   reset:        Function,
 * }}
 */
export function useTmdbInfinite(fetchFn, initialPage = 1) {
  const [allData,      setAllData]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [isFallback,   setIsFallback]   = useState(false)
  const [currentPage,  setCurrentPage]  = useState(initialPage)
  const [totalPages,   setTotalPages]   = useState(null)

  const fetchPage = useCallback(async (page) => {
    if (!fetchFn) return
    setLoading(true)
    setError(null)

    const result = await fetchFn(page)

    setAllData(prev => page === initialPage ? result.data : [...prev, ...(result.data ?? [])])
    setIsFallback(result.isFallback ?? false)
    setTotalPages(result.totalPages ?? null)

    if (!result.success && !result.isFallback) {
      setError(result.error ?? 'Unknown error')
    } else {
      setError(null)
    }

    setLoading(false)
  }, [fetchFn, initialPage])

  // Auto-fetch the initial page on mount
  useEffect(() => {
    fetchPage(initialPage)
  }, [fetchPage, initialPage])

  const loadNextPage = useCallback(() => {
    const next = currentPage + 1
    if (totalPages !== null && next > totalPages) return
    setCurrentPage(next)
    fetchPage(next)
  }, [currentPage, totalPages, fetchPage])

  const reset = useCallback(() => {
    setAllData([])
    setCurrentPage(initialPage)
    setTotalPages(null)
    setError(null)
    setIsFallback(false)
    fetchPage(initialPage)
  }, [initialPage, fetchPage])

  const hasMore = totalPages === null ? true : currentPage < totalPages

  return { data: allData, loading, error, isFallback, currentPage, totalPages, hasMore, loadNextPage, reset }
}
