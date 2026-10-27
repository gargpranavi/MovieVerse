import { createSlice } from '@reduxjs/toolkit'

// Helper to read initial state from localStorage safely
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const initialState = {
  watchlist: readStorage('watchlist', []),
  watchedHistory: readStorage('movieverse_watched', readStorage('watched', [])),
  userPreferences: readStorage('movieverse_preferences', {
    theme: 'dark',
    autoPlayTrailers: true,
    preferredGenres: [],
    notifyOnRelease: true,
    compactView: false,
    language: 'en',
  }),
}

export const watchlistSlice = createSlice({
  name: 'watchlist',
  initialState,
  reducers: {
    addToWatchlist: (state, action) => {
      const movie = action.payload
      if (!movie || movie.id === undefined || movie.id === null) return
      const exists = state.watchlist.some((item) => String(item.id) === String(movie.id))
      if (!exists) {
        state.watchlist.push(movie)
        try {
          localStorage.setItem('watchlist', JSON.stringify(state.watchlist))
        } catch (e) {
          console.error(e)
        }
      }
    },

    removeFromWatchlist: (state, action) => {
      const id = action.payload
      state.watchlist = state.watchlist.filter((item) => String(item.id) !== String(id))
      try {
        localStorage.setItem('watchlist', JSON.stringify(state.watchlist))
      } catch (e) {
        console.error(e)
      }
    },

    addToWatched: (state, action) => {
      const payload = action.payload || {}
      const movie = payload.movie ? payload.movie : payload
      const date = payload.date
      if (!movie || movie.id === undefined || movie.id === null) return

      const watchedDate =
        date ||
        movie.watchedDate ||
        new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })

      const existingIndex = state.watchedHistory.findIndex(
        (item) => String(item.id) === String(movie.id)
      )

      const entry = {
        ...movie,
        watchedDate,
        watchedAt: Date.now(),
      }

      if (existingIndex >= 0) {
        state.watchedHistory[existingIndex] = entry
      } else {
        state.watchedHistory.unshift(entry)
      }

      try {
        localStorage.setItem('movieverse_watched', JSON.stringify(state.watchedHistory))
      } catch (e) {
        console.error(e)
      }
    },

    removeFromWatched: (state, action) => {
      const id = action.payload
      state.watchedHistory = state.watchedHistory.filter(
        (item) => String(item.id) !== String(id)
      )
      try {
        localStorage.setItem('movieverse_watched', JSON.stringify(state.watchedHistory))
      } catch (e) {
        console.error(e)
      }
    },

    updatePreferences: (state, action) => {
      state.userPreferences = {
        ...state.userPreferences,
        ...action.payload,
      }
      try {
        localStorage.setItem(
          'movieverse_preferences',
          JSON.stringify(state.userPreferences)
        )
      } catch (e) {
        console.error(e)
      }
    },

    toggleWatchlist: (state, action) => {
      const movie = action.payload
      if (!movie || movie.id === undefined || movie.id === null) return
      const index = state.watchlist.findIndex((item) => String(item.id) === String(movie.id))
      if (index >= 0) {
        state.watchlist.splice(index, 1)
      } else {
        state.watchlist.push(movie)
      }
      try {
        localStorage.setItem('watchlist', JSON.stringify(state.watchlist))
      } catch (e) {
        console.error(e)
      }
    },

    toggleWatched: (state, action) => {
      const payload = action.payload || {}
      const movie = payload.movie ? payload.movie : payload
      if (!movie || movie.id === undefined || movie.id === null) return

      const index = state.watchedHistory.findIndex((item) => String(item.id) === String(movie.id))
      if (index >= 0) {
        state.watchedHistory.splice(index, 1)
      } else {
        const watchedDate =
          payload.date ||
          movie.watchedDate ||
          new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        state.watchedHistory.unshift({
          ...movie,
          watchedDate,
          watchedAt: Date.now(),
        })
      }
      try {
        localStorage.setItem('movieverse_watched', JSON.stringify(state.watchedHistory))
      } catch (e) {
        console.error(e)
      }
    },

    syncFromStorage: (state) => {
      state.watchlist = readStorage('watchlist', [])
      state.watchedHistory = readStorage('movieverse_watched', [])
      state.userPreferences = readStorage('movieverse_preferences', {
        theme: 'dark',
        autoPlayTrailers: true,
        preferredGenres: [],
        notifyOnRelease: true,
        compactView: false,
        language: 'en',
      })
    },

    clearWatchlist: (state) => {
      state.watchlist = []
      try {
        localStorage.removeItem('watchlist')
      } catch (e) {
        console.error(e)
      }
    },

    clearWatched: (state) => {
      state.watchedHistory = []
      try {
        localStorage.removeItem('movieverse_watched')
      } catch (e) {
        console.error(e)
      }
    },
  },
})

export const {
  addToWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
  addToWatched,
  removeFromWatched,
  toggleWatched,
  updatePreferences,
  syncFromStorage,
  clearWatchlist,
  clearWatched,
} = watchlistSlice.actions

// Selectors
export const selectWatchlist = (state) => state.watchlist.watchlist
export const selectWatchedHistory = (state) => state.watchlist.watchedHistory
export const selectWatchlistCount = (state) => state.watchlist.watchlist.length
export const selectWatchedCount = (state) => state.watchlist.watchedHistory.length
export const selectPreferences = (state) => state.watchlist.userPreferences

export default watchlistSlice.reducer
