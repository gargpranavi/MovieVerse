import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  theme: 'dark',
  activeCategory: 'all',
  isPlayerOpen: false,
  playingMedia: null,
  isSidebarOpen: true,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload
    },
    openPlayer: (state, action) => {
      state.isPlayerOpen = true
      state.playingMedia = action.payload || null
    },
    closePlayer: (state) => {
      state.isPlayerOpen = false
      state.playingMedia = null
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen
    },
  },
})

export const {
  setTheme,
  setActiveCategory,
  openPlayer,
  closePlayer,
  toggleSidebar,
} = uiSlice.actions

export const selectTheme = (state) => state.ui.theme
export const selectActiveCategory = (state) => state.ui.activeCategory
export const selectIsPlayerOpen = (state) => state.ui.isPlayerOpen
export const selectPlayingMedia = (state) => state.ui.playingMedia

export default uiSlice.reducer
