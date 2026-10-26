

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
