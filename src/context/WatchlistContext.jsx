import { createContext, useContext, useReducer, useEffect } from 'react'

const WatchlistContext = createContext(null)

// Storage keys
export const LS_WATCHLIST = 'watchlist'
export const LS_WATCHED_PRIMARY = 'movieverse_watched'
export const LS_WATCHED_LEGACY = 'watched'
export const LS_PREFERENCES = 'movieverse_user_preferences'
export const LS_REMOVED_DEFAULTS = 'movieverse_removed_defaults'

const DEFAULT_PREFERENCES = {
  theme: 'dark',
  autoplayTrailer: false,
  soundEffects: true,
  preferredGenre: 'All',
  contentLanguage: 'en',
}

const initialState = {
  watchlist: [],
  watchedHistory: [],
  userPreferences: DEFAULT_PREFERENCES,
  removedDefaults: [],
}

function loadInitialState() {
  try {
    const rawWatchlist = localStorage.getItem(LS_WATCHLIST)
    const rawWatchedPrimary = localStorage.getItem(LS_WATCHED_PRIMARY)
    const rawWatchedLegacy = localStorage.getItem(LS_WATCHED_LEGACY)
    const rawPreferences = localStorage.getItem(LS_PREFERENCES)
    const rawRemovedDefaults = localStorage.getItem(LS_REMOVED_DEFAULTS)

    const watchlist = rawWatchlist ? JSON.parse(rawWatchlist) : []

    // Merge watched primary and legacy
    let watched = []
    if (rawWatchedPrimary) {
      watched = JSON.parse(rawWatchedPrimary)
    } else if (rawWatchedLegacy) {
      watched = JSON.parse(rawWatchedLegacy)
    }

    const userPreferences = rawPreferences
      ? { ...DEFAULT_PREFERENCES, ...JSON.parse(rawPreferences) }
      : DEFAULT_PREFERENCES

    const removedDefaults = rawRemovedDefaults ? JSON.parse(rawRemovedDefaults) : []

    return {
      watchlist: Array.isArray(watchlist) ? watchlist : [],
      watchedHistory: Array.isArray(watched) ? watched : [],
      userPreferences,
      removedDefaults: Array.isArray(removedDefaults) ? removedDefaults : [],
    }
  } catch (e) {
    console.error('Failed to load initial state from localStorage in WatchlistContext:', e)
    return initialState
  }
}

function watchlistReducer(state, action) {
  switch (action.type) {
    case 'SET_WATCHLIST':
      return {
        ...state,
        watchlist: action.payload,
      }

    case 'ADD_TO_WATCHLIST': {
      const item = action.payload
      if (!item) return state
      const exists = state.watchlist.some(w => String(w.id) === String(item.id))
      if (exists) return state
      return {
        ...state,
        watchlist: [...state.watchlist, item],
      }
    }

    case 'REMOVE_FROM_WATCHLIST': {
      const id = String(action.payload)
      const isDefault = ['2', '5', '10', '19', '29', '32'].includes(id)
      const nextRemoved = isDefault && !state.removedDefaults.includes(id)
        ? [...state.removedDefaults, id]
        : state.removedDefaults

      return {
        ...state,
        watchlist: state.watchlist.filter(w => String(w.id) !== id),
        removedDefaults: nextRemoved,
      }
    }

    case 'TOGGLE_WATCHLIST': {
      const item = action.payload
      if (!item) return state
      const id = String(item.id)
      const exists = state.watchlist.some(w => String(w.id) === id)
      if (exists) {
        const isDefault = ['2', '5', '10', '19', '29', '32'].includes(id)
        const nextRemoved = isDefault && !state.removedDefaults.includes(id)
          ? [...state.removedDefaults, id]
          : state.removedDefaults
        return {
          ...state,
          watchlist: state.watchlist.filter(w => String(w.id) !== id),
          removedDefaults: nextRemoved,
        }
      } else {
        return {
          ...state,
          watchlist: [...state.watchlist, item],
        }
      }
    }

    case 'SET_WATCHED':
      return {
        ...state,
        watchedHistory: action.payload,
      }

    case 'ADD_TO_WATCHED': {
      const { movie, dateStr } = action.payload
      if (!movie) return state
      const id = String(movie.id)
      const formattedDate =
        dateStr ||
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      const watchedEntry = {
        ...movie,
        watchedAt: formattedDate,
        watchedDate: formattedDate,
      }

      const existingIndex = state.watchedHistory.findIndex(w => String(w.id) === id)
      let nextHistory
      if (existingIndex > -1) {
        nextHistory = [...state.watchedHistory]
        nextHistory[existingIndex] = { ...nextHistory[existingIndex], ...watchedEntry }
      } else {
        nextHistory = [...state.watchedHistory, watchedEntry]
      }

      return {
        ...state,
        watchedHistory: nextHistory,
      }
    }

    case 'REMOVE_FROM_WATCHED': {
      const id = String(action.payload)
      return {
        ...state,
        watchedHistory: state.watchedHistory.filter(w => String(w.id) !== id),
      }
    }

    case 'MARK_AS_WATCHED': {
      // Moves item from watchlist to watchedHistory
      const { movie, dateStr } = action.payload
      if (!movie) return state
      const id = String(movie.id)
      const formattedDate =
        dateStr ||
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

      const watchedEntry = {
        ...movie,
        watchedAt: formattedDate,
        watchedDate: formattedDate,
      }

      const existsInWatched = state.watchedHistory.some(w => String(w.id) === id)
      const nextHistory = existsInWatched
        ? state.watchedHistory.map(w => (String(w.id) === id ? { ...w, ...watchedEntry } : w))
        : [...state.watchedHistory, watchedEntry]

      const isDefault = ['2', '5', '10', '19', '29', '32'].includes(id)
      const nextRemoved = isDefault && !state.removedDefaults.includes(id)
        ? [...state.removedDefaults, id]
        : state.removedDefaults

      return {
        ...state,
        watchlist: state.watchlist.filter(w => String(w.id) !== id),
        watchedHistory: nextHistory,
        removedDefaults: nextRemoved,
      }
    }

    case 'MOVE_BACK_TO_WATCHLIST': {
      // Moves item from watchedHistory to watchlist
      const movie = action.payload
      if (!movie) return state
      const id = String(movie.id)
      const { watchedDate: _wd, watchedAt: _wa, userRating: _ur, ...cleanShow } = movie

      const existsInWatchlist = state.watchlist.some(w => String(w.id) === id)
      const nextWatchlist = existsInWatchlist ? state.watchlist : [...state.watchlist, cleanShow]

      return {
        ...state,
        watchlist: nextWatchlist,
        watchedHistory: state.watchedHistory.filter(w => String(w.id) !== id),
      }
    }

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        userPreferences: {
          ...state.userPreferences,
          ...action.payload,
        },
      }

    case 'RESET_PREFERENCES':
      return {
        ...state,
        userPreferences: DEFAULT_PREFERENCES,
      }

    default:
      return state
  }
}

export function WatchlistProvider({ children }) {
  const [state, dispatch] = useReducer(watchlistReducer, initialState, loadInitialState)

  // Sync to localStorage and broadcast legacy custom events for backwards compatibility
  useEffect(() => {
    try {
      localStorage.setItem(LS_WATCHLIST, JSON.stringify(state.watchlist))
      window.dispatchEvent(new Event('watchlistUpdated'))
    } catch (e) {
      console.error('Failed to save watchlist to localStorage:', e)
    }
  }, [state.watchlist])

  useEffect(() => {
    try {
      localStorage.setItem(LS_WATCHED_PRIMARY, JSON.stringify(state.watchedHistory))
      localStorage.setItem(LS_WATCHED_LEGACY, JSON.stringify(state.watchedHistory))
      window.dispatchEvent(new Event('watchedUpdated'))
    } catch (e) {
      console.error('Failed to save watched to localStorage:', e)
    }
  }, [state.watchedHistory])

  useEffect(() => {
    try {
      localStorage.setItem(LS_PREFERENCES, JSON.stringify(state.userPreferences))
    } catch (e) {
      console.error('Failed to save userPreferences to localStorage:', e)
    }
  }, [state.userPreferences])

  useEffect(() => {
    try {
      localStorage.setItem(LS_REMOVED_DEFAULTS, JSON.stringify(state.removedDefaults))
    } catch (e) {
      console.error('Failed to save removedDefaults to localStorage:', e)
    }
  }, [state.removedDefaults])

  // Context API actions
  const addToWatchlist = (movie) => {
    dispatch({ type: 'ADD_TO_WATCHLIST', payload: movie })
  }

  const removeFromWatchlist = (id) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: id })
  }

  const toggleWatchlist = (movie) => {
    dispatch({ type: 'TOGGLE_WATCHLIST', payload: movie })
  }

  const isInWatchlist = (movieId) => {
    if (!movieId) return false
    return state.watchlist.some(w => String(w.id) === String(movieId))
  }

  const setWatchlist = (list) => {
    dispatch({ type: 'SET_WATCHLIST', payload: list })
  }

  const addToWatched = (movie, dateStr) => {
    dispatch({ type: 'ADD_TO_WATCHED', payload: { movie, dateStr } })
  }

  const removeFromWatched = (movieId) => {
    dispatch({ type: 'REMOVE_FROM_WATCHED', payload: movieId })
  }

  const markAsWatched = (movie, dateStr) => {
    dispatch({ type: 'MARK_AS_WATCHED', payload: { movie, dateStr } })
  }

  const moveBackToWatchlist = (movie) => {
    dispatch({ type: 'MOVE_BACK_TO_WATCHLIST', payload: movie })
  }

  const isWatched = (movieId) => {
    if (!movieId) return false
    return state.watchedHistory.some(w => String(w.id) === String(movieId))
  }

  const getWatchedDate = (movieId) => {
    if (!movieId) return null
    const found = state.watchedHistory.find(w => String(w.id) === String(movieId))
    return found ? (found.watchedDate || found.watchedAt || null) : null
  }

  const updatePreferences = (preferences) => {
    dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
  }

  const resetPreferences = () => {
    dispatch({ type: 'RESET_PREFERENCES' })
  }

  const value = {
    // Reducer State
    watchlist: state.watchlist,
    watchedHistory: state.watchedHistory,
    userPreferences: state.userPreferences,
    removedDefaults: state.removedDefaults,

    // Watchlist Actions
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    setWatchlist,

    // Watched History Actions
    addToWatched,
    removeFromWatched,
    markAsWatched,
    moveBackToWatchlist,
    isWatched,
    getWatchedDate,

    // Preferences Actions
    updatePreferences,
    resetPreferences,
  }

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const context = useContext(WatchlistContext)
  if (!context) {
    throw new Error('useWatchlist must be used within a WatchlistProvider')
  }
  return context
}
