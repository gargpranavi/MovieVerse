/*
   MovieVerse – useAuthContext.js
   Member 2 | Hook to consume the AuthContext.

   This is intentionally a plain .js file (no JSX) so that oxlint's
   react/only-export-components rule is satisfied — the hook and the
   provider component live in separate files.

   Usage:
     import { useAuthContext } from '../hooks/useAuthContext'
     const { user, signOut } = useAuthContext()
*/

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Consume auth state in any component inside <AuthProvider>.
 * Throws a descriptive error if called outside the provider tree.
 */
export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error(
      '[MovieVerse] useAuthContext must be called inside <AuthProvider>.\n' +
      'Make sure <AuthProvider> wraps your route tree in main.jsx.'
    )
  }
  return ctx
}
