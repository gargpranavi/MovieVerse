# 🎬 MovieVerse – Piyush's Work (Evaluation 2)

**Branch:** `feature/piyush-eval2-tmdb-infinite-scroll`  
**Member:** Piyush  
**Project:** MovieVerse – A Netflix-style movie discovery web app  
**Tech Stack:** React 19, Vite 8, React Router 7, Vanilla CSS, Supabase

---

## 📋 What I Am Building (Full Scope)

My job in Evaluation 2 is to connect MovieVerse to real, live movie data and add real user authentication.

Here's everything I'll build across 5 days:

| Day | Task | Status |
|-----|------|--------|
| Day 1 | TMDB API Service + Caching + Error Handling + Fallback | ✅ Done |
| Day 2 | Professional Login UI + Supabase Authentication (Google OAuth, Email/Password, Password Reset) | ✅ Done |
| Day 3 | Shimmer Skeleton Loaders + Infinite Scroll on Movies Page | 🔜 Upcoming |
| Day 4 | Infinite Scroll on TV Series Page | 🔜 Upcoming |
| Day 5 | Image CDN Optimization + Lazy Loading + Final Polish | 🔜 Upcoming |

---

## ✅ Day 1 — TMDB API Integration

### What is TMDB?
TMDB (The Movie Database) is a free website, like IMDb, that provides a public API.  
Using this API, we can fetch real movie data — titles, posters, ratings, genres — all live from the internet.

---

### What I Built

I created **3 new files** inside the `src/member2/` folder. No existing files were changed.

---

### File 1: `src/member2/services/tmdbApi.js`
> **The main engine — talks to TMDB and fetches real movies**

This file does all the heavy lifting. Think of it as the "waiter" in a restaurant — it takes your order (what movies you want), goes to the kitchen (TMDB servers), and brings back the food (movie data).

#### Functions available:

| Function | What it does |
|----------|-------------|
| `fetchTrending()` | Gets the most popular/trending movies this week |
| `fetchPopularMovies(page)` | Gets a page of popular movies (supports pagination) |
| `fetchPopularTvShows(page)` | Gets a page of popular TV shows |
| `fetchMovieDetails(id)` | Gets full info about one specific movie |
| `fetchTvDetails(id)` | Gets full info about one specific TV show |
| `fetchMovieCredits(id)` | Gets the cast & crew of a specific movie |
| `searchMovies(query)` | Searches for movies by name |

#### How data is converted (Normalization):
TMDB sends data in its own format. Our app uses a different format.  
So I wrote a converter (`normaliseTmdbItem`) that translates TMDB data into the format our movie cards already understand.

**Example of what the converter does:**

```
TMDB sends this:              →   We convert it to:
─────────────────────────────────────────────────────
poster_path: "/abc.jpg"       →   image: "https://image.tmdb.org/t/p/w500/abc.jpg"
vote_average: 7.85            →   rating: 7.9  (rounded)
genre_ids: [28, 878]          →   genres: ["Action", "Science-Fiction"]
id: 12345                     →   id: "tmdb-12345"  (prefixed to avoid conflicts)
title: "Inception"            →   title: "Inception"  (same)
release_date: "2024-07-04"    →   year: "2024"  (just the year)
```

#### Smart Caching (saves internet data):
Every time we fetch movies from TMDB, we save the result in the browser's memory (`sessionStorage`) for **5 minutes**.

```
First visit  → Fetches from TMDB (1 network request)
Next visit   → Reads from memory (0 network requests, instant!)
After 5 min  → Fetches fresh data from TMDB again
```

This means:
- The app loads faster
- TMDB's rate limits are respected
- Each page number (page 1, page 2...) is cached separately

#### Error Handling — 3 safety layers:

```
Layer 1: No API key?
  → Immediately returns a clear error message
  → Falls back to local shows.js data
  → App still works normally

Layer 2: TMDB server error (404, 500...)?
  → Catches the HTTP error
  → Returns a readable error message like "TMDB HTTP 404: Not Found"
  → Falls back to local shows.js data

Layer 3: No internet / network failure?
  → Catches the network crash
  → Returns "Network error: Failed to reach TMDB"
  → Falls back to local shows.js data
```

#### Local Data Fallback:
If TMDB is ever down or unreachable, the app **automatically switches to local data** (the existing `shows.js` file) so the website never breaks.

The fallback is clearly labeled with `{ isFallback: true, source: 'fallback' }` so the UI can show a small warning banner if needed.

---

### File 2: `src/member2/hooks/useTmdb.js`
> **The React helper — makes it easy to use the API in any page**

Instead of writing the same loading/error code in every page, I created a reusable React hook.

**Without the hook (messy):**
```js
// Every page would need to write all this manually...
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
useEffect(() => {
  fetchPopularMovies(1).then(r => { setData(r.data); setLoading(false) })
}, [])
```

**With the hook (clean):**
```js
// One line does everything
const { data, loading, error, isFallback } = useTmdb(fetchPopularMovies, [1])
```

It provides:
- `data` → the list of movies
- `loading` → true/false while fetching
- `error` → any error message
- `isFallback` → true if showing local data instead of live data
- `refresh()` → re-fetch manually

I also built `useTmdbInfinite` — a special version of the hook that **adds** new pages to the list instead of replacing them. This is pre-built for Day 3 (infinite scroll).

---

### File 3: `.env.example`
> **Instructions for setting up the API key**

```
VITE_TMDB_API_KEY=your_tmdb_v4_read_access_token_here
```

- The real `.env` file (with the actual key) is **never committed to Git** — it's in `.gitignore`
- This example file is safe to commit — it just shows the format
- Anyone cloning the repo can read this file and set up their own key

---

### 🔑 API Credential Used

| Setting | Value |
|---------|-------|
| Auth Type | TMDB v4 Bearer Token (Read Access Token) |
| Environment Variable | `VITE_TMDB_API_KEY` |
| Committed to Git? | ❌ No — safely in `.gitignore` |

---

### ✅ Test Results (Day 1)

| Test | Result |
|------|--------|
| Live TMDB call works | ✅ Got 20 movies, 500 pages available |
| Movie: "Hope" (2026) returned correctly | ✅ |
| Genres resolved (e.g. genre ID 28 → "Action") | ✅ |
| Image is full CDN URL | ✅ `https://image.tmdb.org/t/p/w500/...` |
| ID prefixed to avoid collision | ✅ `tmdb-1058424` |
| Rating rounded to 1 decimal | ✅ `6.9` |
| Bad ID handled gracefully | ✅ Returns `success: false` with error message |
| Lint check (oxlint) | ✅ 0 warnings, 0 errors |
| Production build | ✅ Built in 1.05s |
| `.env` gitignored | ✅ Confirmed |

---

### 📁 Files Changed in Day 1

| File | Type | What it is |
|------|------|-----------|
| `src/member2/services/tmdbApi.js` | ✅ New | Main TMDB API service |
| `src/member2/hooks/useTmdb.js` | ✅ New | React hook for easy API usage |
| `src/member2/services/tmdbApi.verify.js` | ✅ New | Browser console test script |
| `.env.example` | ✅ New | Template for API key setup |
| `.env` | ✅ New (local only) | Actual API key — NOT committed |

**No existing files were modified. No teammate files were touched.**

---

### 🚫 Why You Can't See It on the Website Yet

Day 1 is a **backend/data layer task** — like installing pipes behind a wall.  
The pipes are ready, but no taps are connected yet.

The Movies and TV Series pages still use the old local `shows.js` data.  
Starting **Day 3**, these pages will call `fetchPopularMovies()` and show real TMDB movies with live posters and ratings.

---

### 🧠 How to Test Day 1 Manually

1. Make sure the dev server is running: `npm run dev`
2. Open browser → `http://localhost:5173`
3. Press **F12** → go to **Console** tab
4. Copy the entire contents of `tmdbApi.verify.js`
5. Paste into the console and press Enter
6. All 8 test groups will run with ✅ PASS / ❌ FAIL results

---

## ✅ Day 2 — Professional Login UI + Supabase Authentication

### What I Built

A complete, production-quality authentication system with a cinematic dark-themed login page.  
This covers the entire auth lifecycle — sign-in, sign-up, Google OAuth, forgot password, and setting a new password after a reset link.

---

### New Files Created (Day 2)

| File | What it is |
|------|-----------|
| `src/member2/services/supabaseClient.js` | Single Supabase client instance for the whole app |
| `src/member2/hooks/useAuth.js` | React hook managing the full auth lifecycle |
| `src/member2/context/AuthContext.jsx` | React context + provider for app-wide auth state |
| `src/member2/hooks/useAuthContext.js` | Consumer hook that reads from AuthContext |
| `src/member2/components/ProtectedRoute.jsx` | Route guard — redirects unauthenticated users to `/login` |
| `src/member2/components/ProtectedRoute.module.css` | Spinner styles for the loading state |

### Existing Files Modified (Day 2)

| File | What changed |
|------|-------------|
| `src/member2/pages/LoginPage.jsx` | Full redesign: cinematic UI, all auth modes, validation, error messages |
| `src/member2/pages/LoginPage.module.css` | Complete premium dark-mode stylesheet |
| `src/member2/pages/ProfilePage.jsx` | Now reads real Supabase user (name, avatar, email) |
| `src/App.jsx` | All routes now wrapped in `<ProtectedRoute>`, OAuth callback route added |
| `src/main.jsx` | `<AuthProvider>` now wraps `<App>` |
| `.env.example` | Supabase variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) added |

---

### Architecture

```
src/main.jsx
  └─ <BrowserRouter>
       └─ <AuthProvider>          ← wraps everything, provides auth state app-wide
            └─ <App>
                 ├─ /login        ← LoginPage (public, no guard)
                 ├─ /home         ← <ProtectedRoute> → HomePage
                 ├─ /profile      ← <ProtectedRoute> → ProfilePage
                 ├─ /watchlist    ← <ProtectedRoute> → WatchlistPage2
                 ├─ /anime        ← <ProtectedRoute> → AnimePage
                 └─ ...all other routes guarded the same way
```

**Data flow:**
```
supabaseClient.js  →  useAuth.js (hook)  →  AuthContext.jsx (provider)
                                                    ↓
                                          useAuthContext.js (consumer hook)
                                                    ↓
                           LoginPage.jsx / ProtectedRoute.jsx / ProfilePage.jsx
```

---

### File Details

#### `src/member2/services/supabaseClient.js`
- Creates **one** Supabase client (singleton — no duplicate clients anywhere)
- Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from `.env`
- Shows a console warning in dev mode if credentials are missing
- Configured with `persistSession: true`, `autoRefreshToken: true`, `detectSessionInUrl: true`

#### `src/member2/hooks/useAuth.js`
All authentication logic in one place:

| Function | What it does |
|----------|-------------|
| `signIn(email, password)` | Signs in with email + password |
| `signUp(email, password)` | Creates new account, triggers confirmation email |
| `signInWithGoogle()` | Starts Google OAuth redirect flow |
| `sendPasswordReset(email)` | Emails a password reset link |
| `updatePassword(newPassword)` | Sets a new password after clicking reset link |
| `signOut()` | Logs out and clears the session |

All errors pass through `friendlyError()` which converts raw Supabase errors into human-readable messages  
(e.g., "Invalid login credentials" → "Incorrect email or password. Please try again.").

#### `src/member2/context/AuthContext.jsx` + `useAuthContext.js`
- `AuthProvider` wraps the app and makes auth state available everywhere
- Any component calls `const { user, signOut } = useAuthContext()` — no prop-drilling needed

#### `src/member2/components/ProtectedRoute.jsx`
Behaviour:
- **Loading** → shows a full-screen spinner (prevents unauthenticated flash on slow connections)
- **Not signed in** → redirects to `/login`, remembers the attempted URL via React Router `state`
- **Signed in** → renders the page normally
- After sign-in, the user is sent back to the page they originally tried to visit

---

### Login Page — 4 Modes

| Mode | Trigger | What the user sees |
|------|---------|-------------------|
| Sign In | Default on load | Email + password + "Continue with Google" + "Forgot password?" |
| Sign Up | Click "Sign Up" tab | Email + password + confirm-password + "Create Account" |
| Forgot Password | Click "Forgot password?" | Email field + "Send Reset Link" button |
| Set New Password | Clicking the reset link in email | New password field + "Update Password" button |

**UI highlights:**
- Cinematic dark-mode design with glassmorphism card and gradient background
- Animated film-reel branding
- Show/hide password toggle
- Remember Me (saves email in `localStorage`)
- Field-level validation with inline error messages under each input
- Alert banners for success and error feedback
- Buttons show a spinner and disable during requests (prevents double-submit)
- Fully responsive: desktop, tablet, and mobile
- Accessible: semantic labels, ARIA attributes, keyboard navigation, visible focus states

---

### Google OAuth — How It Works

```
User clicks "Continue with Google"
    ↓
supabase.auth.signInWithOAuth({ provider: 'google', redirectTo: '/home' })
    ↓
Browser opens Google account chooser
    ↓
User picks their Google account
    ↓
Google redirects to Supabase callback URL
    ↓
Supabase exchanges the code, sets session in localStorage, redirects to /home
    ↓
ProtectedRoute detects session → renders HomePage normally
```

---

### Password Reset — How It Works (End-to-End)

```
1. User clicks "Forgot password?" → enters email → clicks "Send Reset Link"
2. Supabase emails a link:  /login#access_token=...&type=recovery
3. User clicks link → browser opens LoginPage
4. useEffect detects #type=recovery in the URL hash
5. Hash is cleaned from the address bar immediately
6. Page switches to "Set new password" mode
7. User enters new password (min 6 chars) → clicks "Update Password"
8. supabase.auth.updateUser({ password }) is called
9. Success → "Password updated! Redirecting…" banner → auto-navigates to /home after 1.8s
```

---

### Environment Variables Required

| Variable | Where to find it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public key |
| `VITE_TMDB_API_KEY` | Already set ✅ — TMDB works without any extra steps |

> **Important:** After editing `.env`, always restart `npm run dev`. Vite reads `.env` only at startup.

---

### Supabase Dashboard Settings

| Setting | Location | Required Value |
|---------|----------|---------------|
| Google provider | Authentication → Providers → Google | Enabled + Client ID + Client Secret (from Google Cloud) |
| Site URL | Authentication → URL Configuration | `http://localhost:5173` |
| Redirect URLs | Authentication → URL Configuration | `http://localhost:5173/home`, `http://localhost:5173/login`, `http://localhost:5173/auth/callback` |

---

### ✅ Test Results (Day 2)

| Test | Result |
|------|--------|
| Lint check on all new files | ✅ 0 errors, 0 warnings |
| Production build | ✅ Built in 1.36s, exit 0 |
| Google OAuth sign-in | ✅ Confirmed working |
| Email + password sign-in | ✅ Confirmed working |
| Session persists after page refresh | ✅ (`persistSession: true`) |
| Protected routes redirect to `/login` | ✅ All routes guarded |
| Password reset email flow (end-to-end) | ✅ Complete |
| Profile page shows real Supabase user name + avatar | ✅ |
| No credentials committed to Git | ✅ `.env` in `.gitignore` |

---

### 🧠 How to Test Day 2 Manually

#### Prerequisites
1. Paste real Supabase credentials into `.env` (restart dev server after)
2. Google provider enabled in Supabase (Authentication → Providers → Google) with Client ID + Secret
3. Redirect URLs configured in Supabase (Authentication → URL Configuration)
4. Run `npm run dev`

#### Test: Route Protection
```
Open http://localhost:5173/home       → redirects to /login  ✓
Open http://localhost:5173/watchlist  → redirects to /login  ✓
```

#### Test: Google Sign-In
```
1. Click "Continue with Google"
2. Google account chooser opens
3. Pick your account → lands on /home  ✓
```

#### Test: Email Sign-Up
```
1. Click "Sign Up" tab
2. Enter email, password (≥6 chars), confirm password
3. Click "Create Account" → "Account created! Check your email…" banner  ✓
4. Click confirmation link in email → now signed in  ✓
```

#### Test: Email Sign-In
```
1. Enter wrong password → "Incorrect email or password."  ✓
2. Enter correct credentials → spinner → "Welcome back! Redirecting…" → /home  ✓
```

#### Test: Forgot Password
```
1. Click "Forgot password?"
2. Enter email → "Send Reset Link" → email arrives in inbox
3. Click link in email → auto-switches to "Set new password" form  ✓
4. Enter new password → "Password updated! Redirecting to home…" → /home  ✓
```

---

### 📁 Complete Files Summary — Day 1 + Day 2

| File | Type | Day |
|------|------|-----|
| `src/member2/services/tmdbApi.js` | ✅ New | Day 1 |
| `src/member2/hooks/useTmdb.js` | ✅ New | Day 1 |
| `src/member2/services/tmdbApi.verify.js` | ✅ New | Day 1 |
| `src/member2/services/supabaseClient.js` | ✅ New | Day 2 |
| `src/member2/hooks/useAuth.js` | ✅ New | Day 2 |
| `src/member2/context/AuthContext.jsx` | ✅ New | Day 2 |
| `src/member2/hooks/useAuthContext.js` | ✅ New | Day 2 |
| `src/member2/components/ProtectedRoute.jsx` | ✅ New | Day 2 |
| `src/member2/components/ProtectedRoute.module.css` | ✅ New | Day 2 |
| `src/member2/pages/LoginPage.jsx` | ✏️ Modified | Day 2 |
| `src/member2/pages/LoginPage.module.css` | ✏️ Modified | Day 2 |
| `src/member2/pages/ProfilePage.jsx` | ✏️ Modified | Day 2 |
| `src/App.jsx` | ✏️ Modified | Day 2 |
| `src/main.jsx` | ✏️ Modified | Day 2 |
| `.env.example` | ✏️ Modified | Day 1 + Day 2 |
| `.env` | ✅ New (local only, not committed) | Day 1 + Day 2 |

**No teammate files were touched. All Day 1 TMDB functionality is preserved.**

---

*Day 3 will add shimmer skeleton loaders and infinite scroll on the Movies page.*
