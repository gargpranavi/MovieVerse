/*
   MovieVerse – useAuth.js
   Member 2 | React hook that manages local localStorage authentication.

   Replaces Supabase auth with a self-contained localStorage system.
   All other files (AuthContext, useAuthContext, ProtectedRoute) are unchanged
   — they only interact with the return value of this hook.

   Provides:
     • session    – current Session object ({ userId, email, name, avatar }) or null
     • user       – shorthand for session (same shape, null = unauthenticated)
     • loading    – true during initial session restore from localStorage
     • authError  – last friendly error string (or null)
     • signIn     – email + password sign-in
     • signUp     – email + password sign-up (logs in immediately)
     • signOut    – clears session from localStorage
     • resetPassword(email, newPassword) – updates password locally
     • signInWithGoogle – shows "not available" message (removed)
*/

import { useState, useEffect, useCallback } from 'react'
import {
  getSession,
  signIn   as localSignIn,
  signUp   as localSignUp,
  signOut  as localSignOut,
  resetPassword as localResetPassword,
} from '../services/localAuth.js'

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useAuth() {
  // undefined = initialising (hasn't read localStorage yet)
  const [session,   setSession]   = useState(undefined)
  const [authError, setAuthError] = useState(null)

  // ── Restore session on mount ─────────────────────────────────────────────
  useEffect(() => {
    const stored = getSession()
    setSession(stored ?? null)
  }, [])

  // ── Listen for cross-tab sign-out / sign-in via storage events ───────────
  useEffect(() => {
    function onStorage(e) {
      if (e.key === 'mv_session') {
        setSession(getSession())
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email, password) => {
    setAuthError(null)
    if (!email || !password) {
      const msg = 'Please enter your email and password.'
      setAuthError(msg)
      return { success: false, error: msg }
    }

    const { session: newSession, error } = localSignIn(email, password)
    if (error) {
      setAuthError(error)
      return { success: false, error }
    }
    setSession(newSession)
    return { success: true }
  }, [])

  // ── Sign Up ──────────────────────────────────────────────────────────────
  const signUp = useCallback(async (email, password, name) => {
    setAuthError(null)
    if (!email || !password) {
      const msg = 'Please enter your email and password.'
      setAuthError(msg)
      return { success: false, error: msg }
    }

    const { session: newSession, error } = localSignUp(email, password, name)
    if (error) {
      setAuthError(error)
      return { success: false, error }
    }
    setSession(newSession)
    return { success: true }
  }, [])

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    setAuthError(null)
    localSignOut()
    setSession(null)
    return { success: true }
  }, [])

  // ── Reset Password ───────────────────────────────────────────────────────
  const sendPasswordReset = useCallback(async (email) => {
    setAuthError(null)
    // Without email sending we just confirm the address exists.
    // The UI will prompt for a new password directly.
    const { error } = localResetPassword(email, 'temp-placeholder')
    if (error && error.includes('No account')) {
      setAuthError(error)
      return { success: false, error }
    }
    // Return success so the UI can proceed to the new-password step
    return { success: true }
  }, [])

  const updatePassword = useCallback(async (email, newPassword) => {
    setAuthError(null)
    const { error } = localResetPassword(email, newPassword)
    if (error) {
      setAuthError(error)
      return { success: false, error }
    }
    return { success: true }
  }, [])

  // ── Google OAuth — not available in local mode ───────────────────────────
  const signInWithGoogle = useCallback(async () => {
    const msg = 'Google sign-in is not available in offline mode. Please use email and password.'
    setAuthError(msg)
    return { success: false, error: msg }
  }, [])

  return {
    session,
    /** Convenience alias — same object as session */
    user:    session ?? null,
    /** True while localStorage is being read on first mount */
    loading: session === undefined,
    authError,
    signIn,
    signUp,
    signOut,
    sendPasswordReset,
    updatePassword,
    signInWithGoogle,
  }
}
