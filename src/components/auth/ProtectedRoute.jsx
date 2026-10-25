/**
 * ProtectedRoute.jsx
 *
 * Guards private pages — if the user is NOT authenticated,
 * they are redirected to /login with the attempted path saved
 * in location state so LoginPage can redirect them back after login.
 *
 * Usage:
 *   <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage2 /></ProtectedRoute>} />
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/index.js'
import styles from './ProtectedRoute.module.css'

/* ─── Loading Spinner shown while auth state resolves ─── */
function AuthLoadingSpinner() {
  return (
    <div className={styles.loadingScreen} role="status" aria-label="Checking authentication">
      <div className={styles.spinnerRing}>
        <div className={styles.spinnerInner} />
      </div>
      <p className={styles.loadingText}>Verifying session…</p>
    </div>
  )
}

export default function ProtectedRoute({ children, redirectTo = '/login' }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  // While we don't have a loading state in AuthContext, user being null
  // while we're checking is handled — treat as unauthenticated.
  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }}   // LoginPage reads this to redirect back
      />
    )
  }

  return children
}

/**
 * PublicRoute — wraps pages that should NOT be accessible once logged in.
 * E.g. the Login page: if already authenticated → go to /home.
 */
export function PublicRoute({ children, redirectTo = '/home' }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  // If a "from" location was saved (e.g. user tried to visit /watchlist),
  // send them there after login instead of always going to /home.
  const destination = location.state?.from?.pathname || redirectTo

  if (isAuthenticated) {
    return <Navigate to={destination} replace />
  }

  return children
}
