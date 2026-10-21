/*
   MovieVerse – AuthContext.jsx
   Member 2 | React context + provider for app-wide auth state.

   Exports:
     • AuthContext  – the raw context object (imported by useAuthContext.js)
     • AuthProvider – wrap this around your route tree in main.jsx

   The consumer hook lives in hooks/useAuthContext.js (separate file to satisfy
   the react/only-export-components lint rule).

   Usage:
     // main.jsx
     import { AuthProvider } from './member2/context/AuthContext'
     <AuthProvider><App /></AuthProvider>

     // Any page or component:
     import { useAuthContext } from './member2/hooks/useAuthContext'
     const { user, signOut } = useAuthContext()
*/

import { createContext } from 'react'
import { useAuth } from '../hooks/useAuth'

/** Shared context object — imported by the consumer hook, not by application code. */
// eslint-disable-next-line react/only-export-components -- context object must co-locate with its provider
export const AuthContext = createContext(null)

/**
 * Provides auth state (session, user, signIn, signUp, signOut …) to all
 * descendant components. Place once near the root of your component tree.
 */
export function AuthProvider({ children }) {
  const auth = useAuth()
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}
