import { createContext, useContext, useReducer, useEffect } from 'react'

const AuthContext = createContext(null)

const AUTH_STORAGE_KEY = 'movieverse_auth_user'
const SAVED_IDENTIFIER_KEY = 'movieverse_saved_identifier'

const initialState = {
  user: null,
  isAuthenticated: false,
  savedIdentifier: '',
}

function loadInitialAuthState() {
  try {
    const savedUser = localStorage.getItem(AUTH_STORAGE_KEY)
    const savedIdentifier = localStorage.getItem(SAVED_IDENTIFIER_KEY) || ''
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser)
      return {
        user: parsedUser,
        isAuthenticated: true,
        savedIdentifier: parsedUser?.identifier || savedIdentifier,
      }
    }
    return {
      user: null,
      isAuthenticated: false,
      savedIdentifier,
    }
  } catch (e) {
    console.error('Error loading auth from localStorage:', e)
    return initialState
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const user = action.payload
      return {
        ...state,
        user,
        isAuthenticated: true,
        savedIdentifier: user?.identifier || state.savedIdentifier,
      }
    }
    case 'LOGOUT': {
      return {
        ...state,
        user: null,
        isAuthenticated: false,
      }
    }
    case 'UPDATE_PROFILE': {
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      }
    }
    case 'SET_SAVED_IDENTIFIER': {
      return {
        ...state,
        savedIdentifier: action.payload,
      }
    }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, loadInitialAuthState)

  // Sync to localStorage
  useEffect(() => {
    try {
      if (state.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state.user))
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    } catch (e) {
      console.error('Failed to sync auth user to localStorage:', e)
    }
  }, [state.user])

  useEffect(() => {
    try {
      if (state.savedIdentifier) {
        localStorage.setItem(SAVED_IDENTIFIER_KEY, state.savedIdentifier)
      } else {
        localStorage.removeItem(SAVED_IDENTIFIER_KEY)
      }
    } catch (e) {
      console.error('Failed to sync savedIdentifier to localStorage:', e)
    }
  }, [state.savedIdentifier])

  const login = (userData, rememberMe = false) => {
    const userObj = typeof userData === 'string' 
      ? {
          id: 1,
          identifier: userData,
          username: userData.split('@')[0],
          displayName: userData.split('@')[0],
          email: userData.includes('@') ? userData : `${userData}@movieverse.com`,
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
          role: 'Movie Explorer',
          bio: 'Passionate about cinema, storytelling, and discovering hidden gems across genres.',
          joined: '2026-01-15',
          location: 'India',
          favoriteGenre: 'Sci-Fi & Thriller'
        }
      : userData

    dispatch({ type: 'LOGIN', payload: userObj })
    if (rememberMe) {
      dispatch({ type: 'SET_SAVED_IDENTIFIER', payload: userObj.identifier || userObj.username || '' })
    } else {
      dispatch({ type: 'SET_SAVED_IDENTIFIER', payload: '' })
    }
    return userObj
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const updateProfile = (updates) => {
    dispatch({ type: 'UPDATE_PROFILE', payload: updates })
  }

  const setRememberedIdentifier = (idStr) => {
    dispatch({ type: 'SET_SAVED_IDENTIFIER', payload: idStr })
  }

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    savedIdentifier: state.savedIdentifier,
    login,
    logout,
    updateProfile,
    setRememberedIdentifier,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
