/*
   MovieVerse – ProtectedRoute.jsx
   Member 2 | Route guard for authenticated pages.

   Usage in App.jsx:
     <Route path="/watchlist" element={
       <ProtectedRoute><WatchlistPage2 /></ProtectedRoute>
     } />

   Behaviour:
   • While auth state is loading → shows a full-screen spinner (no redirect flash)
   • Unauthenticated          → redirects to /login (preserves attempted path via `state`)
   • Authenticated            → renders children normally
*/

import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../../hooks/useAuthContext'
import styles from './ProtectedRoute.module.css'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuthContext()
  const location = useLocation()

  /* ── Still restoring session from localStorage ── */
  if (loading) {
    return (
      <div className={styles.loadingScreen} aria-label="Checking authentication…">
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading…</p>
      </div>
    )
  }

  /* ── Not signed in ── */
  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    )
  }

  /* ── Authenticated ── */
  return children
}
