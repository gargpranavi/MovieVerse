import { createContext, useContext, useReducer, useEffect, useCallback, useMemo } from 'react'
import {
  getSession,
  signIn as localSignIn,
  signUp as localSignUp,
  signOut as localSignOut,
  resetPassword as localResetPassword,
  updateProfile as localUpdateProfile,
} from '../member2/services/localAuth.js'
import { mockUsers } from '../member2/data/users2.js'

// ── Action Types ──────────────────────────────────────────────────────────────
export const AUTH_ACTIONS = {
  START:        'AUTH_START',
  SUCCESS:      'AUTH_SUCCESS',
  FAILURE:      'AUTH_FAILURE',
  LOGOUT:       'LOGOUT',
  UPDATE_USER:  'UPDATE_USER',
  CLEAR_ERROR:  'CLEAR_ERROR',
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const DEFAULT_BASE = mockUsers?.[0] || {
  role:   'Movie Explorer',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  joined: '2026-01-15',
}

function buildUser(session) {
  if (!session) return null
  const name = session.name || session.email?.split('@')[0] || 'Piyush'
  return {
    id:          session.userId || 'default-user',
    email:       session.email  || 'user@movieverse.com',
    name,
    displayName: name,
    username:    name,
    avatar:      session.avatar || DEFAULT_BASE.avatar,
    role:        DEFAULT_BASE.role   || 'Movie Explorer',
    joined:      DEFAULT_BASE.joined || '2026-01-15',
  }
}

const DEMO_SESSION = {
  userId: 'user-demo-piyush',
  email:  'piyush@movieverse.com',
  name:   'Piyush',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  token:  'demo-token',
  createdAt: new Date().toISOString(),
}

function getInitialState() {
  const session = getSession() || DEMO_SESSION
  return { session, user: buildUser(session), isAuthenticated: true, loading: false, error: null }
}

// ── Reducer ───────────────────────────────────────────────────────────────────
export function authReducer(state, { type, payload }) {
  switch (type) {
    case AUTH_ACTIONS.START:
      return { ...state, loading: true, error: null }

    case AUTH_ACTIONS.SUCCESS:
      return { ...state, session: payload, user: buildUser(payload), isAuthenticated: true, loading: false, error: null }

    case AUTH_ACTIONS.FAILURE:
      return { ...state, loading: false, error: payload }

    case AUTH_ACTIONS.LOGOUT:
      return { ...state, session: null, user: null, isAuthenticated: false, loading: false, error: null }

    case AUTH_ACTIONS.UPDATE_USER: {
      const user    = state.user    ? { ...state.user,    ...payload } : null
      const session = state.session ? { ...state.session, ...payload } : null
      return { ...state, user, session }
    }

    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    default:
      return state
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
export const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, null, getInitialState)

  // Cross-tab session sync
  useEffect(() => {
    const sync = (e) => {
      if (e.key !== 'mv_session' && e.key !== null) return
      const session = getSession()
      dispatch({ type: session ? AUTH_ACTIONS.SUCCESS : AUTH_ACTIONS.LOGOUT, payload: session })
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  // ── Auth operations ───────────────────────────────────────────────────────
  const signIn = useCallback((email, password) => {
    dispatch({ type: AUTH_ACTIONS.START })
    try {
      const res = localSignIn(email, password)
      if (res.error) { dispatch({ type: AUTH_ACTIONS.FAILURE, payload: res.error }); return { success: false, error: res.error } }
      dispatch({ type: AUTH_ACTIONS.SUCCESS, payload: res.session })
      return { success: true, session: res.session }
    } catch (err) {
      const msg = err?.message || 'Failed to sign in'
      dispatch({ type: AUTH_ACTIONS.FAILURE, payload: msg })
      return { success: false, error: msg }
    }
  }, [])

  const signUp = useCallback((email, password, name) => {
    dispatch({ type: AUTH_ACTIONS.START })
    try {
      const res = localSignUp(email, password, name)
      if (res.error) { dispatch({ type: AUTH_ACTIONS.FAILURE, payload: res.error }); return { success: false, error: res.error } }
      dispatch({ type: AUTH_ACTIONS.SUCCESS, payload: res.session })
      return { success: true, session: res.session }
    } catch (err) {
      const msg = err?.message || 'Failed to sign up'
      dispatch({ type: AUTH_ACTIONS.FAILURE, payload: msg })
      return { success: false, error: msg }
    }
  }, [])

  const signOut = useCallback(() => {
    try { localSignOut() } catch (err) { console.error('[Auth] signOut:', err) }
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
    return { success: true }
  }, [])

  const updateProfile = useCallback((name) => {
    try {
      const res = localUpdateProfile(name)
      if (res.error) return { success: false, error: res.error }
      dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: { name, displayName: name, username: name } })
      return { success: true }
    } catch (err) {
      return { success: false, error: err?.message || 'Failed to update profile' }
    }
  }, [])

  const resetPassword = useCallback((email, newPassword) => localResetPassword(email, newPassword), [])
  const clearError    = useCallback(() => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR }), [])

  const value = useMemo(() => ({
    user:            state.user,
    session:         state.session,
    isAuthenticated: state.isAuthenticated,
    loading:         state.loading,
    error:           state.error,
    // Methods & aliases
    signIn,  login:         signIn,
    signUp,  signup:        signUp,
    signOut, logout:        signOut,
    updateProfile,
    resetPassword,   updatePassword: resetPassword,
    clearError,
    dispatch,
  }), [state.user, state.session, state.isAuthenticated, state.loading, state.error,
      signIn, signUp, signOut, updateProfile, resetPassword, clearError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an <AuthProvider>')
  return ctx
}

export default AuthContext
