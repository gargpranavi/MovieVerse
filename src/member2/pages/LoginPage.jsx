/*
   MovieVerse – LoginPage.jsx
   Member 2 | Professional cinematic login / sign-up / password-reset page
   Supabase Auth: email+password, Google OAuth, password reset
*/

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '../hooks/useAuthContext'
import styles from './LoginPage.module.css'

/* ─── Mode constants ─────────────────────────────────────────────────────── */
const MODE_SIGNIN       = 'signin'
const MODE_SIGNUP       = 'signup'
const MODE_RESET        = 'reset'
const MODE_NEW_PASSWORD = 'new_password'  // After clicking a Supabase reset-email link

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function FilmReelIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <circle cx="6"  cy="6"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="6"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="6"  cy="18" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="3"  r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="21" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

function EyeOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8
               a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12
               4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07
               a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

/* ─── Background scene ───────────────────────────────────────────────────── */
function Background() {
  return (
    <div className={styles.bgScene} aria-hidden="true">
      <div className={styles.bgImage} />
      <div className={styles.bgVignette} />
      <div className={styles.bgOverlay} />
      <div className={styles.bgGlow} />
    </div>
  )
}

/* ─── Floating film strip decorations ───────────────────────────────────── */
function FilmStrip() {
  return (
    <div className={styles.filmStrip} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.filmFrame} />
      ))}
    </div>
  )
}

/* ─── Alert banner ───────────────────────────────────────────────────────── */
function Alert({ message, type, onDismiss }) {
  if (!message) return null
  return (
    <div
      className={`${styles.alert} ${styles[`alert_${type}`]}`}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.alertIcon}>
        {type === 'error'   && '⚠'}
        {type === 'success' && '✓'}
        {type === 'info'    && 'ℹ'}
      </span>
      <span className={styles.alertText}>{message}</span>
      {onDismiss && (
        <button
          type="button"
          className={styles.alertDismiss}
          onClick={onDismiss}
          aria-label="Dismiss"
        >×</button>
      )}
    </div>
  )
}

/* ─── Inline field error ─────────────────────────────────────────────────── */
function FieldError({ message }) {
  if (!message) return null
  return (
    <span className={styles.fieldError} role="alert">
      {message}
    </span>
  )
}

/* ─── Email validation ───────────────────────────────────────────────────── */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { session, loading: authLoading, signIn, signUp, signInWithGoogle,
          sendPasswordReset, updatePassword: setNewPassword } = useAuthContext()

  /* Where to go after login (supports /login redirects from ProtectedRoute) */
  const from = location.state?.from || '/home'

  /* ── Form mode: signin | signup | reset | new_password ── */
  const [mode, setMode] = useState(MODE_SIGNIN)

  /* ── Detect Supabase password-recovery token in the URL hash on mount ──
     When a user clicks the reset-password email link, Supabase appends
     #access_token=...&type=recovery to the redirectTo URL.
     detectSessionInUrl:true in supabaseClient.js consumes the hash and fires
     an onAuthStateChange("PASSWORD_RECOVERY") event, but we also check the
     hash ourselves so we can show the new-password form immediately. */
  useEffect(() => {
    const hash = window.location.hash
    if (hash.includes('type=recovery')) {
      setMode(MODE_NEW_PASSWORD)
      // Clean the hash from the URL bar without triggering a navigation
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [])

  /* ── Field state ── */
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [rememberMe,  setRememberMe]  = useState(false)

  /* ── UI state ── */
  const [submitting,    setSubmitting]    = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [alert,         setAlert]         = useState(null)   // { text, type }
  const [fieldErrors,   setFieldErrors]   = useState({})

  /* ── Redirect if already authenticated (but not when setting a new password) ── */
  useEffect(() => {
    if (!authLoading && session && mode !== MODE_NEW_PASSWORD) {
      navigate(from, { replace: true })
    }
  }, [session, authLoading, navigate, from, mode])

  /* ── Restore remembered email ── */
  useEffect(() => {
    const saved = localStorage.getItem('movieverse_remembered_email')
    if (saved) { setEmail(saved); setRememberMe(true) }
  }, [])

  /* ── Sync remember-me ── */
  useEffect(() => {
    if (rememberMe && email.trim()) {
      localStorage.setItem('movieverse_remembered_email', email.trim())
    } else if (!rememberMe) {
      localStorage.removeItem('movieverse_remembered_email')
    }
  }, [rememberMe, email])

  /* ── Clear state on mode switch ── */
  const switchMode = useCallback((newMode) => {
    setMode(newMode)
    setAlert(null)
    setFieldErrors({})
    setPassword('')
    setConfirmPass('')
    setShowPass(false)
    setShowConfirm(false)
  }, [])

  const clearAlert = () => setAlert(null)

  /* ── Client-side validation ── */
  const validate = useCallback(() => {
    const errors = {}

    // Email is hidden in new-password mode; Supabase already has the session
    if (mode !== MODE_NEW_PASSWORD) {
      if (!email.trim()) {
        errors.email = 'Email is required.'
      } else if (!isValidEmail(email)) {
        errors.email = 'Enter a valid email address.'
      }
    }

    if (mode !== MODE_RESET) {
      if (!password) {
        errors.password = 'Password is required.'
      } else if (password.length < 6) {
        errors.password = 'Password must be at least 6 characters.'
      }
    }

    if (mode === MODE_SIGNUP) {
      if (!confirmPass) {
        errors.confirmPass = 'Please confirm your password.'
      } else if (confirmPass !== password) {
        errors.confirmPass = 'Passwords do not match.'
      }
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }, [email, password, confirmPass, mode])

  /* ── Form submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (submitting) return
    clearAlert()

    if (!validate()) return

    setSubmitting(true)

    try {
      if (mode === MODE_NEW_PASSWORD) {
        const result = await setNewPassword(password)
        if (result.success) {
          setAlert({
            text: 'Password updated! You are now signed in. Redirecting to home…',
            type: 'success',
          })
          setTimeout(() => navigate('/home', { replace: true }), 1800)
        } else {
          setAlert({ text: result.error, type: 'error' })
        }
        return
      }

      if (mode === MODE_RESET) {
        const result = await sendPasswordReset(email.trim())
        if (result.success) {
          setAlert({
            text: 'Password reset email sent! Check your inbox (and spam folder).',
            type: 'success',
          })
        } else {
          setAlert({ text: result.error, type: 'error' })
        }
        return
      }

      if (mode === MODE_SIGNUP) {
        const result = await signUp(email.trim(), password)
        if (result.success) {
          setAlert({
            text: 'Account created! Please check your email to confirm your address before signing in.',
            type: 'success',
          })
          switchMode(MODE_SIGNIN)
        } else {
          setAlert({ text: result.error, type: 'error' })
        }
        return
      }

      /* MODE_SIGNIN */
      const result = await signIn(email.trim(), password)
      if (result.success) {
        setAlert({ text: 'Welcome back! Redirecting…', type: 'success' })
        /* onAuthStateChange will update session → useEffect above navigates */
      } else {
        setAlert({ text: result.error, type: 'error' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Google OAuth ── */
  const handleGoogleSignIn = async () => {
    if (googleLoading || submitting) return
    setGoogleLoading(true)
    clearAlert()
    const result = await signInWithGoogle()
    if (!result.success) {
      setAlert({ text: result.error, type: 'error' })
      setGoogleLoading(false)
    }
    /* On success the browser navigates away; no need to reset loading */
  }

  /* ── Clear field errors on change ── */
  const updateEmail = (v) => {
    setEmail(v)
    if (fieldErrors.email) setFieldErrors(f => ({ ...f, email: null }))
    clearAlert()
  }
  const onPasswordChange = (v) => {
    setPassword(v)
    if (fieldErrors.password) setFieldErrors(f => ({ ...f, password: null }))
    clearAlert()
  }
  const updateConfirm = (v) => {
    setConfirmPass(v)
    if (fieldErrors.confirmPass) setFieldErrors(f => ({ ...f, confirmPass: null }))
  }

  const isSubmitDisabled = submitting || googleLoading

  /* ── Dynamic heading / CTA ── */
  const headingMap = {
    [MODE_SIGNIN]:       { title: 'Welcome back',         cta: 'Sign In',           sub: null },
    [MODE_SIGNUP]:       { title: 'Create account',       cta: 'Create Account',    sub: null },
    [MODE_RESET]:        { title: 'Reset password',       cta: 'Send Reset Link',   sub: "Enter your email and we'll send a link to reset your password." },
    [MODE_NEW_PASSWORD]: { title: 'Set new password',     cta: 'Update Password',   sub: 'Enter a new password for your account. Minimum 6 characters.' },
  }
  const { title, cta, sub } = headingMap[mode]

  /* Don't render the page at all while we confirm the auth state (avoids flicker) */
  if (authLoading) {
    return (
      <div className={styles.root}>
        <Background />
        <div className={styles.pageWrapper}>
          <div className={styles.initSpinner} aria-label="Loading…" />
        </div>
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <Background />
      <FilmStrip />

      <main className={styles.pageWrapper}>
        <article className={styles.loginCard}>

          {/* ── Brand ── */}
          <header className={styles.brandHeader}>
            <div className={styles.brandLogo} aria-hidden="true">
              <FilmReelIcon />
            </div>
            <h1 className={styles.brandName}>MovieVerse</h1>
            <p className={styles.brandTagline}>Discover &bull; Watch &bull; Remember</p>
          </header>

          {/* ── Mode tabs (hidden when in new-password mode from reset email) ── */}
          {mode !== MODE_NEW_PASSWORD && (
          <div className={styles.modeTabs} role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              id="tab-signin"
              aria-selected={mode === MODE_SIGNIN}
              className={`${styles.modeTab} ${mode === MODE_SIGNIN ? styles.modeTabActive : ''}`}
              onClick={() => switchMode(MODE_SIGNIN)}
            >Sign In</button>
            <button
              type="button"
              role="tab"
              id="tab-signup"
              aria-selected={mode === MODE_SIGNUP}
              className={`${styles.modeTab} ${mode === MODE_SIGNUP ? styles.modeTabActive : ''}`}
              onClick={() => switchMode(MODE_SIGNUP)}
            >Sign Up</button>
          </div>
          )}

          {/* ── Sub-heading for non-signin modes ── */}
          {(mode !== MODE_SIGNIN) && (
            <div className={styles.modeHeading}>
              <h2 className={styles.modeTitle}>{title}</h2>
              {sub && <p className={styles.modeSub}>{sub}</p>}
            </div>
          )}

          {/* ── Alert banner ── */}
          <Alert
            message={alert?.text}
            type={alert?.type}
            onDismiss={clearAlert}
          />

          {/* ── Form ── */}
          <form
            id="authForm"
            className={styles.form}
            onSubmit={handleSubmit}
            noValidate
            aria-label={`MovieVerse ${title} form`}
          >

            {/* Email — hidden in new-password mode (session is already set by Supabase) */}
            {mode !== MODE_NEW_PASSWORD && (
            <div className={styles.field}>
              <label htmlFor="authEmail" className={styles.label}>
                Email address
              </label>
              <div className={`${styles.inputWrap} ${fieldErrors.email ? styles.inputInvalid : ''}`}>
                <span className={styles.inputIcon}><MailIcon /></span>
                <input
                  id="authEmail"
                  type="email"
                  className={styles.input}
                  value={email}
                  onChange={e => updateEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  aria-required="true"
                  aria-describedby={fieldErrors.email ? 'emailErr' : undefined}
                  aria-invalid={!!fieldErrors.email}
                  disabled={isSubmitDisabled}
                  required
                />
              </div>
              <FieldError message={fieldErrors.email} />
            </div>
            )}

            {/* Password (hidden in reset mode; shown in new-password mode with new-password label) */}
            {mode !== MODE_RESET && (
              <div className={styles.field}>
                <label htmlFor="authPassword" className={styles.label}>
                  {mode === MODE_NEW_PASSWORD ? 'New password' : 'Password'}
                </label>
                <div className={`${styles.inputWrap} ${fieldErrors.password ? styles.inputInvalid : ''}`}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input
                    id="authPassword"
                    type={showPass ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithToggle}`}
                    value={password}
                    onChange={e => onPasswordChange(e.target.value)}
                    placeholder={mode === MODE_SIGNUP ? 'Minimum 6 characters' : 'Your password'}
                    autoComplete={mode === MODE_SIGNUP ? 'new-password' : 'current-password'}
                    aria-required="true"
                    aria-describedby={fieldErrors.password ? 'passErr' : undefined}
                    aria-invalid={!!fieldErrors.password}
                    disabled={isSubmitDisabled}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    aria-pressed={showPass}
                    onClick={() => setShowPass(v => !v)}
                    tabIndex={0}
                  >
                    {showPass ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                <FieldError message={fieldErrors.password} />
              </div>
            )}

            {/* Confirm password (sign-up only) */}
            {mode === MODE_SIGNUP && (
              <div className={styles.field}>
                <label htmlFor="authConfirm" className={styles.label}>
                  Confirm password
                </label>
                <div className={`${styles.inputWrap} ${fieldErrors.confirmPass ? styles.inputInvalid : ''}`}>
                  <span className={styles.inputIcon}><LockIcon /></span>
                  <input
                    id="authConfirm"
                    type={showConfirm ? 'text' : 'password'}
                    className={`${styles.input} ${styles.inputWithToggle}`}
                    value={confirmPass}
                    onChange={e => updateConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    aria-required="true"
                    aria-invalid={!!fieldErrors.confirmPass}
                    disabled={isSubmitDisabled}
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                    aria-pressed={showConfirm}
                    onClick={() => setShowConfirm(v => !v)}
                    tabIndex={0}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeOpenIcon />}
                  </button>
                </div>
                <FieldError message={fieldErrors.confirmPass} />
              </div>
            )}

            {/* Options row (sign-in only) */}
            {mode === MODE_SIGNIN && (
              <div className={styles.optionsRow}>
                <label className={styles.checkLabel} htmlFor="rememberMe">
                  <input
                    id="rememberMe"
                    type="checkbox"
                    className={styles.checkbox}
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                  />
                  <span className={styles.checkmark} aria-hidden="true" />
                  Remember me
                </label>
                <button
                  type="button"
                  className={styles.forgotBtn}
                  onClick={() => switchMode(MODE_RESET)}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Primary CTA */}
            <button
              id="authSubmitBtn"
              type="submit"
              className={styles.btnPrimary}
              disabled={isSubmitDisabled}
              aria-busy={submitting}
            >
              {submitting
                ? <span className={styles.btnSpinner} aria-label="Processing…" />
                : cta
              }
            </button>

            {/* Back to sign-in (from reset or new-password mode) */}
            {(mode === MODE_RESET || mode === MODE_NEW_PASSWORD) && (
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => switchMode(MODE_SIGNIN)}
              >
                ← Back to Sign In
              </button>
            )}

          </form>

          {/* ── Divider + Google (not shown in reset or new-password mode) ── */}
          {(mode !== MODE_RESET && mode !== MODE_NEW_PASSWORD) && (
            <>
              <div className={styles.divider} role="separator">
                <div className={styles.dividerLine} />
                <span className={styles.dividerText}>or continue with</span>
                <div className={styles.dividerLine} />
              </div>

              {/* Google sign-in — full-width prominent button */}
              <button
                id="googleSignInBtn"
                type="button"
                className={styles.btnGoogle}
                onClick={handleGoogleSignIn}
                disabled={isSubmitDisabled}
                aria-busy={googleLoading}
                aria-label="Continue with Google"
              >
                {googleLoading
                  ? <span className={styles.btnSpinnerDark} aria-label="Connecting to Google…" />
                  : (
                    <>
                      <span className={styles.googleIconWrap}><GoogleIcon /></span>
                      <span>Continue with Google</span>
                    </>
                  )
                }
              </button>
            </>
          )}

          {/* ── Footer toggle ── */}
          <p className={styles.footerPrompt}>
            {mode === MODE_SIGNIN
              ? <>New to MovieVerse? <button type="button" className={styles.footerLink} onClick={() => switchMode(MODE_SIGNUP)}>Create an account</button></>
              : mode === MODE_SIGNUP
              ? <>Already have an account? <button type="button" className={styles.footerLink} onClick={() => switchMode(MODE_SIGNIN)}>Sign in</button></>
              : null
            }
          </p>

        </article>
      </main>
    </div>
  )
}
