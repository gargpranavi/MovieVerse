/*
   MovieVerse – useAuth.js
   Member 2 | React hook that manages the Supabase authentication lifecycle.

   Provides:
     • session    – current Supabase Session (null = unauthenticated)
     • user       – shorthand for session?.user
     • loading    – true while the initial session is being restored
     • authError  – last auth error string (or null)
     • signIn     – email + password sign-in
     • signUp     – email + password sign-up
     • signInWithGoogle  – Google OAuth (redirect flow)
     • sendPasswordReset – sends reset email
     • signOut    – logs out and clears session

   The hook sets up an onAuthStateChange listener that properly cleans up on
   unmount, preventing memory leaks.
*/

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../services/supabaseClient'

/* ─── Error message normaliser ─────────────────────────────────────────────── */
function friendlyError(error) {
  if (!error) return null
  const msg = error.message ?? String(error)

  if (msg.includes('Invalid login credentials'))
    return 'Incorrect email or password. Please try again.'
  if (msg.includes('Email not confirmed'))
    return 'Please verify your email address before signing in. Check your inbox.'
  if (msg.includes('User already registered'))
    return 'An account with this email already exists. Sign in instead.'
  if (msg.includes('Password should be at least'))
    return 'Password must be at least 6 characters long.'
  if (msg.includes('Unable to validate email address'))
    return 'Please enter a valid email address.'
  if (msg.includes('rate limit') || msg.includes('too many requests'))
    return 'Too many attempts. Please wait a moment and try again.'
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch'))
    return 'Network error. Check your internet connection and try again.'
  if (msg.includes('OAuth'))
    return 'Google sign-in failed. Please try again or use email and password.'

  return msg
}

/* ─── Hook ──────────────────────────────────────────────────────────────────── */
export function useAuth() {
  const [session,   setSession]   = useState(undefined)  // undefined = initialising
  const [authError, setAuthError] = useState(null)

  /* ── Restore session on mount and listen for changes ── */
  useEffect(() => {
    // Get the current session immediately (handles page refresh)
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
    })

    // Subscribe to future auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null)
        // Clear any lingering error on successful auth events
        if (newSession) setAuthError(null)
      }
    )

    // Cleanup – prevents listener from firing after component unmounts
    return () => subscription.unsubscribe()
  }, [])

  /* ── Sign In with Email + Password ── */
  const signIn = useCallback(async (email, password) => {
    setAuthError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    return { success: true }
  }, [])

  /* ── Sign Up with Email + Password ── */
  const signUp = useCallback(async (email, password) => {
    setAuthError(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    // Supabase sends a confirmation email by default; the user is not signed in yet.
    return { success: true, needsEmailConfirmation: true }
  }, [])

  /* ── Sign In with Google (OAuth redirect) ── */
  const signInWithGoogle = useCallback(async () => {
    setAuthError(null)
    const redirectTo = `${window.location.origin}/home`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        // Request openid + profile so Supabase can populate user metadata
        scopes: 'openid profile email',
      },
    })
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    // Browser will redirect to Google; control doesn't return here on success
    return { success: true }
  }, [])

  /* ── Send Password Reset Email ── */
  const sendPasswordReset = useCallback(async (email) => {
    setAuthError(null)
    const redirectTo = `${window.location.origin}/login`
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    return { success: true }
  }, [])

  /* ── Sign Out ── */
  const signOut = useCallback(async () => {
    setAuthError(null)
    const { error } = await supabase.auth.signOut()
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    return { success: true }
  }, [])

  /* ── Update Password (used after clicking a reset-password email link) ── */
  const updatePassword = useCallback(async (newPassword) => {
    setAuthError(null)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setAuthError(friendlyError(error))
      return { success: false, error: friendlyError(error) }
    }
    return { success: true }
  }, [])

  return {
    /** Current Supabase session, or null when signed out, or undefined while loading */
    session,
    /** Shorthand for session?.user */
    user:    session?.user ?? null,
    /** True until the initial getSession() resolves */
    loading: session === undefined,
    /** Last friendly error string, or null */
    authError,
    signIn,
    signUp,
    signInWithGoogle,
    sendPasswordReset,
    updatePassword,
    signOut,
  }
}
