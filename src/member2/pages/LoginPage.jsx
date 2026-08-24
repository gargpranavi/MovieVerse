import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './LoginPage.module.css'

/* Poster data */
const POSTER_COLORS = [
  'linear-gradient(160deg,#1a0a2e,#3d1a6e,#7b2d8b)',
  'linear-gradient(160deg,#0d1b2a,#1b4975,#1a8a9c)',
  'linear-gradient(160deg,#1a0500,#6b1a0a,#c43b0a)',
  'linear-gradient(160deg,#050e18,#0f3460,#16213e)',
  'linear-gradient(160deg,#0f0c00,#4a3800,#b88b00)',
  'linear-gradient(160deg,#080d0a,#0e4a2a,#1a8a52)',
  'linear-gradient(160deg,#1c0a0a,#5c1a1a,#a03020)',
  'linear-gradient(160deg,#0a0a1c,#1a1a5c,#2a2aa0)',
  'linear-gradient(160deg,#0c0a00,#3d3000,#8a6a00)',
  'linear-gradient(160deg,#0a1a0a,#1a4a1a,#2a8a2a)',
  'linear-gradient(160deg,#1a0a1a,#4a1a4a,#8a2a8a)',
  'linear-gradient(160deg,#001a1a,#004a4a,#008a8a)',
  'linear-gradient(160deg,#1a1000,#4a3000,#9a6000)',
  'linear-gradient(160deg,#0a0010,#1a0030,#4a0070)',
  'linear-gradient(160deg,#001010,#003030,#007070)',
  'linear-gradient(160deg,#100a00,#503500,#b07a00)',
  'linear-gradient(160deg,#100010,#500050,#a000a0)',
  'linear-gradient(160deg,#001000,#004000,#008000)',
  'linear-gradient(160deg,#0a0808,#3a1e1e,#8a4a20)',
  'linear-gradient(160deg,#080a14,#182050,#2040b0)',
  'linear-gradient(160deg,#0a0a06,#2a2a10,#6a6a00)',
  'linear-gradient(160deg,#0e0008,#380020,#800050)',
  'linear-gradient(160deg,#000e0e,#003838,#007878)',
  'linear-gradient(160deg,#10080a,#401820,#903040)',
]

/* Sub-components */
function Background() {
  return (
    <div className={styles.bgScene} aria-hidden="true">
      <div className={styles.bgImage} />
      <div className={styles.bgVignette} />
      <div className={styles.bgGlow} />
    </div>
  )
}

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

function EyeIcon({ visible }) {
  return visible ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94
               M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19
               m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/* Simulated auth (replace with real API)  */
function simulateAuth(identifier, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (identifier.trim() && password.length >= 6) {
        resolve({ user: identifier })
      } else if (password.length < 6) {
        reject(new Error('Password must be at least 6 characters.'))
      } else {
        reject(new Error('Invalid email/username or password.'))
      }
    }, 1200)
  })
}

/* Main Component */
export default function LoginPage() {
  const navigate = useNavigate()

  const [identifier, setIdentifier]     = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe]     = useState(false)
  const [loading, setLoading]           = useState(false)
  const [message, setMessage]           = useState(null) // { text, type }
  const [invalidFields, setInvalidFields] = useState({})

  /* Load remembered identifier */
  useEffect(() => {
    const saved = localStorage.getItem('movieverse_saved_identifier')
    if (saved) {
      setIdentifier(saved)
      setRememberMe(true)
    }
  }, [])

  /* Sync remember-me to localStorage */
  useEffect(() => {
    if (rememberMe && identifier.trim()) {
      localStorage.setItem('movieverse_saved_identifier', identifier.trim())
    } else if (!rememberMe) {
      localStorage.removeItem('movieverse_saved_identifier')
    }
  }, [rememberMe, identifier])

  const clearMessage = () => setMessage(null)

  const validate = useCallback(() => {
    const errors = {}
    if (!identifier.trim()) errors.identifier = true
    if (!password.trim())   errors.password   = true
    setInvalidFields(errors)
    return Object.keys(errors).length === 0
  }, [identifier, password])

  /* Form submit */
  const handleSubmit = async (e) => {
    e.preventDefault()
    clearMessage()

    if (!validate()) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' })
      return
    }

    setLoading(true)
    try {
      await simulateAuth(identifier, password)
      setMessage({ text: 'Welcome back! Redirecting…', type: 'success' })
      setTimeout(() => navigate('/home'), 1200)
    } catch (err) {
      setMessage({ text: err.message || 'Something went wrong.', type: 'error' })
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider) => {
    // TODO: wire up real OAuth
    alert(`${provider} sign-in coming soon!`)
  }

  return (
    <div className={styles.root}>
      <Background />

      <main className={styles.pageWrapper}>
        <article className={styles.loginCard}>

          {/* Brand */}
          <header className={styles.brandHeader}>
            <div className={styles.brandLogo} aria-hidden="true">
              <FilmReelIcon />
            </div>
            <h1 className={styles.brandName}>MovieVerse</h1>
            <p className={styles.brandTagline}>Discover &bull; Watch &bull; Remember</p>
          </header>

          {/* Alert message */}
          {message && (
            <div className={`${styles.formMessage} ${styles[message.type]}`} role="alert">
              {message.text}
            </div>
          )}

          {/* Form */}
          <form className={styles.loginForm} onSubmit={handleSubmit} noValidate>

            {/* Identifier */}
            <div className={styles.inputGroup}>
              <label className={styles.srOnly} htmlFor="loginIdentifier">
                Email or Username
              </label>
              <span className={styles.inputIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </span>
              <input
                id="loginIdentifier"
                className={`${styles.inputField} ${invalidFields.identifier ? styles.invalid : ''}`}
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value)
                  setInvalidFields(f => ({ ...f, identifier: false }))
                  clearMessage()
                }}
                placeholder="Email or Username"
                autoComplete="username"
                aria-required="true"
                required
              />
            </div>

            {/* Password */}
            <div className={`${styles.inputGroup} ${styles.passwordWrapper}`}>
              <label className={styles.srOnly} htmlFor="loginPassword">
                Password
              </label>
              <span className={styles.inputIcon} aria-hidden="true">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                id="loginPassword"
                className={`${styles.inputField} ${invalidFields.password ? styles.invalid : ''}`}
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setInvalidFields(f => ({ ...f, password: false }))
                  clearMessage()
                }}
                placeholder="Password"
                autoComplete="current-password"
                aria-required="true"
                required
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(v => !v)}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>

            {/* Options row */}
            <div className={styles.optionsRow}>
              <label className={styles.rememberLabel} htmlFor="rememberMe">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className={styles.rememberCheckbox}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className={styles.forgotLink}
                onClick={() => alert('Password reset coming soon!')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={styles.btnSignin}
              id="signinBtn"
              disabled={loading}
            >
              {loading
                ? <span className={styles.spinner} aria-label="Signing in…" />
                : 'Sign In'
              }
            </button>

            {/* Divider */}
            <div className={styles.divider} role="separator">
              <div className={styles.dividerLine} />
              <span className={styles.dividerText}>or continue with</span>
              <div className={styles.dividerLine} />
            </div>

            {/* Social logins */}
            <div className={styles.socialRow} role="group" aria-label="Social login options">

              {/* Google */}
              <button type="button" id="googleSignin"
                      className={styles.btnSocial}
                      aria-label="Sign in with Google"
                      onClick={() => handleSocialLogin('Google')}>
                <svg viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>

              {/* Apple */}
              <button type="button" id="appleSignin"
                      className={styles.btnSocial}
                      aria-label="Sign in with Apple"
                      onClick={() => handleSocialLogin('Apple')}>
                <svg viewBox="0 0 24 24" fill="#f0f0f5">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11" />
                </svg>
              </button>

              {/* Instagram */}
              <button type="button" id="instagramSignin"
                      className={styles.btnSocial}
                      aria-label="Sign in with Instagram"
                      onClick={() => handleSocialLogin('Instagram')}>
                <svg viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%"   stopColor="#F58529"/>
                      <stop offset="50%"  stopColor="#DD2A7B"/>
                      <stop offset="100%" stopColor="#8134AF"/>
                    </linearGradient>
                  </defs>
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="url(#igGrad)" strokeWidth="2"/>
                  <circle cx="12" cy="12" r="4.5" stroke="url(#igGrad)" strokeWidth="2"/>
                  <circle cx="17.5" cy="6.5" r="1.2" fill="#DD2A7B"/>
                </svg>
              </button>

            </div>

            {/* Register link */}
            <p className={styles.registerPrompt}>
              New here?
              <Link to="/register" className={styles.registerLink} id="createAccountLink">
                Create an account
              </Link>
            </p>

          </form>
        </article>
      </main>
    </div>
  )
}
