/*
   MovieVerse – localAuth.js
   Member 2 | localStorage-based email + password authentication service.

   Data shape (stored in localStorage):
   ─────────────────────────────────────
   mv_users   : JSON array of User objects
   mv_session : JSON Session object or absent

   User  { id, email, password, name, avatar, createdAt }
   Session { userId, email, name, avatar, token, createdAt }

   Security note: passwords are stored in plain text in localStorage.
   This is intentional for a demo/evaluation environment where there is
   no server-side component. Do NOT use this approach in production.
*/

// ── Storage keys ──────────────────────────────────────────────────────────────
const USERS_KEY   = 'mv_users'
const SESSION_KEY = 'mv_session'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function generateId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function generateToken() {
  return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2)
}

function buildSession(user) {
  return {
    userId:    user.id,
    email:     user.email,
    name:      user.name,
    avatar:    user.avatar ?? null,
    token:     generateToken(),
    createdAt: new Date().toISOString(),
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/** Returns the current session object, or null if not signed in. */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/** Persists a session object (called internally after sign-in / sign-up). */
function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

/** Removes the session (sign-out). */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

/**
 * Sign in with email + password.
 * @returns {{ session, error }}
 */
export function signIn(email, password) {
  const users = getUsers()
  const user  = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())

  if (!user) {
    return { session: null, error: 'No account found with that email address.' }
  }
  if (user.password !== password) {
    return { session: null, error: 'Incorrect password. Please try again.' }
  }

  const session = buildSession(user)
  saveSession(session)
  return { session, error: null }
}

/**
 * Create a new account.
 * @returns {{ session, error }}
 */
export function signUp(email, password, name) {
  const users = getUsers()
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim())

  if (exists) {
    return { session: null, error: 'An account with this email already exists. Sign in instead.' }
  }
  if (!password || password.length < 6) {
    return { session: null, error: 'Password must be at least 6 characters.' }
  }

  const newUser = {
    id:        generateId(),
    email:     email.toLowerCase().trim(),
    password,
    name:      name?.trim() || email.split('@')[0],
    avatar:    null,
    createdAt: new Date().toISOString(),
  }

  saveUsers([...users, newUser])

  const session = buildSession(newUser)
  saveSession(session)
  return { session, error: null }
}

/**
 * Sign out — clears the session.
 */
export function signOut() {
  clearSession()
  return { error: null }
}

/**
 * Reset password by email.
 * If the email exists, the password is updated directly (no email sent).
 * @returns {{ error }}
 */
export function resetPassword(email, newPassword) {
  if (!newPassword || newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters.' }
  }

  const users = getUsers()
  const idx   = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim())

  if (idx === -1) {
    return { error: 'No account found with that email address.' }
  }

  users[idx] = { ...users[idx], password: newPassword }
  saveUsers(users)
  return { error: null }
}

/**
 * Update the display name for the currently signed-in user.
 * @returns {{ error }}
 */
export function updateProfile(name) {
  const session = getSession()
  if (!session) return { error: 'Not signed in.' }

  const users = getUsers()
  const idx   = users.findIndex(u => u.id === session.userId)
  if (idx === -1) return { error: 'User not found.' }

  users[idx] = { ...users[idx], name: name?.trim() || users[idx].name }
  saveUsers(users)

  // Update the session name too
  saveSession({ ...session, name: users[idx].name })
  return { error: null }
}
