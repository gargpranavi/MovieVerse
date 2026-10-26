import { createSlice } from '@reduxjs/toolkit'

function getInitialUser() {
  try {
    const raw = localStorage.getItem('mv_session')
    if (raw) {
      const data = JSON.parse(raw)
      return {
        user: data.user || data,
        isAuthenticated: true,
      }
    }
  } catch {
    /* ignore */
  }

  return {
    user: {
      id: 'demo-user-1',
      name: 'Piyush',
      email: 'piyush@movieverse.com',
      role: 'Movie Explorer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    },
    isAuthenticated: true,
  }
}

const initial = getInitialUser()

const initialState = {
  user: initial.user,
  isAuthenticated: initial.isAuthenticated,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      try {
        localStorage.setItem('mv_session', JSON.stringify({ user: action.payload }))
      } catch (e) {
        console.error(e)
      }
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      try {
        localStorage.removeItem('mv_session')
      } catch (e) {
        console.error(e)
      }
    },

    updateProfile: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        }
        try {
          localStorage.setItem('mv_session', JSON.stringify({ user: state.user }))
        } catch (e) {
          console.error(e)
        }
      }
    },
  },
})

export const { login, logout, updateProfile } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated

export default authSlice.reducer
