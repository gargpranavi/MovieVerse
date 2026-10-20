# 🎬 MovieVerse – Piyush's Work (Evaluation 2)

**Branch:** `feature/piyush-eval2-tmdb-infinite-scroll`  
**Member:** Piyush  
**Project:** MovieVerse – A Netflix-style movie discovery web app  
**Tech Stack:** React 19, Vite 8, React Router 7, Vanilla CSS

---

## 📋 What I Am Building (Full Scope)

My job in Evaluation 2 is to connect MovieVerse to real, live movie data from the internet — instead of the fake local data it currently uses.

Here's everything I'll build across 5 days:

| Day | Task | Status |
|-----|------|--------|
| Day 1 | TMDB API Service + Caching + Error Handling + Fallback | ✅ Done |
| Day 2 | Shimmer Skeleton Loaders | 🔜 Upcoming |
| Day 3 | Infinite Scroll on Movies Page | 🔜 Upcoming |
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

*Day 2 will add shimmer skeleton loaders — animated placeholders that show while movies are loading from TMDB.*
