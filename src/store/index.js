import { configureStore } from '@reduxjs/toolkit'
import watchlistReducer from './slices/watchlistSlice.js'
import authReducer from './slices/authSlice.js'
import uiReducer from './slices/uiSlice.js'

export const store = configureStore({
  reducer: {
    watchlist: watchlistReducer,
    auth: authReducer,
    ui: uiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
})

// Export action creators and selectors for convenient imports
export * from './slices/watchlistSlice.js'
export * from './slices/authSlice.js'
export * from './slices/uiSlice.js'
export { useWatchlist } from './useWatchlist.js'

export default store

