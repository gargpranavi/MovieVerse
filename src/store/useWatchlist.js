import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addToWatchlist as reduxAddToWatchlist,
  removeFromWatchlist as reduxRemoveFromWatchlist,
  toggleWatchlist as reduxToggleWatchlist,
  addToWatched as reduxAddToWatched,
  removeFromWatched as reduxRemoveFromWatched,
  toggleWatched as reduxToggleWatched,
  updatePreferences as reduxUpdatePreferences,
  clearWatchlist as reduxClearWatchlist,
  clearWatched as reduxClearWatched,
  selectWatchlist,
  selectWatchedHistory,
  selectWatchlistCount,
  selectWatchedCount,
  selectPreferences,
} from './slices/watchlistSlice.js'

/**
 * useWatchlist Hook — powered by Redux Toolkit!
 * Connects all UI components directly to the Redux Store.
 */
export function useWatchlist() {
  const dispatch = useDispatch()

  // State from Redux
  const watchlist = useSelector(selectWatchlist)
  const watchedHistory = useSelector(selectWatchedHistory)
  const userPreferences = useSelector(selectPreferences)
  const watchlistCount = useSelector(selectWatchlistCount)
  const watchedCount = useSelector(selectWatchedCount)

  // Actions dispatched to Redux
  const addToWatchlist = useCallback((movie) => {
    dispatch(reduxAddToWatchlist(movie))
  }, [dispatch])

  const removeFromWatchlist = useCallback((id) => {
    dispatch(reduxRemoveFromWatchlist(id))
  }, [dispatch])

  const toggleWatchlist = useCallback((movie) => {
    if (!movie || movie.id === undefined || movie.id === null) return false
    const currentlyIn = watchlist.some((item) => String(item.id) === String(movie.id))
    dispatch(reduxToggleWatchlist(movie))
    return !currentlyIn
  }, [dispatch, watchlist])

  const isInWatchlist = useCallback((id) => {
    if (id === undefined || id === null) return false
    return watchlist.some((item) => String(item.id) === String(id))
  }, [watchlist])

  const clearWatchlist = useCallback(() => {
    dispatch(reduxClearWatchlist())
  }, [dispatch])

  const addToWatched = useCallback((movie, dateStr) => {
    dispatch(reduxAddToWatched({ movie, date: dateStr }))
  }, [dispatch])

  const removeFromWatched = useCallback((id) => {
    dispatch(reduxRemoveFromWatched(id))
  }, [dispatch])

  const toggleWatched = useCallback((movie) => {
    if (!movie || movie.id === undefined || movie.id === null) return false
    const currentlyWatched = watchedHistory.some((item) => String(item.id) === String(movie.id))
    dispatch(reduxToggleWatched(movie))
    return !currentlyWatched
  }, [dispatch, watchedHistory])

  const isWatched = useCallback((id) => {
    if (id === undefined || id === null) return false
    return watchedHistory.some((item) => String(item.id) === String(id))
  }, [watchedHistory])

  const getWatchedDate = useCallback((id) => {
    if (id === undefined || id === null) return null
    const item = watchedHistory.find((i) => String(i.id) === String(id))
    return item ? (item.watchedDate || item.watchedAt || null) : null
  }, [watchedHistory])

  const clearWatched = useCallback(() => {
    dispatch(reduxClearWatched())
  }, [dispatch])

  const updatePreferences = useCallback((partialPrefs) => {
    dispatch(reduxUpdatePreferences(partialPrefs))
  }, [dispatch])

  const setPreference = useCallback((key, value) => {
    dispatch(reduxUpdatePreferences({ [key]: value }))
  }, [dispatch])

  return useMemo(() => ({
    // State
    watchlist,
    watchedHistory,
    watched: watchedHistory,
    userPreferences,
    preferences: userPreferences,

    // Counts
    watchlistCount,
    watchedCount,

    // Watchlist helpers
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    clearWatchlist,

    // Watched helpers
    addToWatched,
    removeFromWatched,
    toggleWatched,
    isWatched,
    getWatchedDate,
    clearWatched,

    // Preferences helpers
    updatePreferences,
    setPreference,

    // Raw Redux Dispatch
    dispatch,
  }), [
    watchlist,
    watchedHistory,
    userPreferences,
    watchlistCount,
    watchedCount,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    clearWatchlist,
    addToWatched,
    removeFromWatched,
    toggleWatched,
    isWatched,
    getWatchedDate,
    clearWatched,
    updatePreferences,
    setPreference,
    dispatch,
  ])
}
