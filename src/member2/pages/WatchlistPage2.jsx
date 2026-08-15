/* =============================================
   Filmoria – WatchlistPage2.jsx
   Member 2 | Watchlist Page
   Fetches real data from feecq.github.io API
   ============================================= */

import { useState, useEffect } from 'react'
import WatchlistCard2 from '../components/WatchlistCard2.jsx'
import styles from './WatchlistPage2.module.css'

/* ── API URL ─────────────────────────────────── */
const API_URL = 'https://feecq.github.io/api/movies.json'

/* ── LocalStorage keys ───────────────────────── */
const LS_WATCHLIST = 'filmoria_watchlist'
const LS_WATCHED   = 'filmoria_watched'

/* ── Icons ───────────────────────────────────── */
function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="2.18"/>
      <line x1="7" y1="2" x2="7" y2="22"/>
      <line x1="17" y1="2" x2="17" y2="22"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <line x1="2" y1="7" x2="7" y2="7"/>
      <line x1="2" y1="17" x2="7" y2="17"/>
      <line x1="17" y1="17" x2="22" y2="17"/>
      <line x1="17" y1="7" x2="22" y2="7"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className={styles.spinnerSvg} viewBox="0 0 50 50" aria-hidden="true">
      <circle className={styles.spinnerCircle} cx="25" cy="25" r="20"
              fill="none" strokeWidth="4"/>
    </svg>
  )
}

/* ── localStorage helpers ────────────────────── */
function getWatched() {
  try { return JSON.parse(localStorage.getItem(LS_WATCHED) || '[]') } catch { return [] }
}
function setWatched(list) {
  try { localStorage.setItem(LS_WATCHED, JSON.stringify(list)) } catch { /* ignore */ }
}

/* ── EmptyState ──────────────────────────────── */
function EmptyState() {
  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <div className={styles.emptyIcon}><FilmIcon /></div>
      <h2 className={styles.emptyTitle}>Your watchlist is empty</h2>
      <p className={styles.emptyText}>
        Movies you want to watch will appear here.<br/>
        Start exploring and add some films!
      </p>
      <a href="/explore" className={styles.exploreBtn} id="exploreFromWatchlist">
        Explore Movies
      </a>
    </div>
  )
}

/* ── Skeleton loader card ────────────────────── */
function SkeletonCard() {
  return <div className={styles.skeleton} aria-hidden="true" />
}

/* ── Toast ───────────────────────────────────── */
function Toast({ message, visible }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}
         role="status" aria-live="polite">
      {message}
    </div>
  )
}

/* ── Main Page ───────────────────────────────── */
export default function WatchlistPage2() {
  const [allMovies, setAllMovies] = useState([])   // full list from API
  const [removed, setRemoved]     = useState([])   // IDs removed by user
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('default')
  const [toast, setToast]         = useState({ message: '', visible: false })

  /* ── Fetch from API ──────────────────────── */
  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error: ${res.status}`)
        return res.json()
      })
      .then(data => {
        setAllMovies(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  /* ── Toast helper ─── */
  function showToast(msg) {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  /* ── Remove from watchlist ─── */
  function handleRemove(id) {
    const updated = [...removed, id]
    setRemoved(updated)
    showToast('Removed from watchlist')
  }

  /* ── Mark as watched ─── */
  function handleMarkWatched(id) {
    const movie = allMovies.find(m => m.id === id)
    if (movie) {
      const watched = getWatched()
      const alreadyWatched = watched.some(m => m.id === id)
      if (!alreadyWatched) {
        setWatched([...watched, { ...movie, watchedDate: new Date().toISOString().split('T')[0] }])
      }
    }
    // Also remove from watchlist view
    const updated = [...removed, id]
    setRemoved(updated)
    showToast('✓ Moved to Watched')
  }

  /* ── Active watchlist = all API movies minus removed ones ─── */
  const watchlist = allMovies.filter(m => !removed.includes(m.id))

  /* ── Filtered + sorted ─── */
  const displayed = watchlist
    .filter(m => m.movie.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'title')  return a.movie.localeCompare(b.movie)
      return 0  // default = API order
    })

  return (
    <div className={styles.page}>

      {/* ── Ambient background ──────────────── */}
      <div className={styles.bgScene} aria-hidden="true">
        <div className={styles.bgGlow1} />
        <div className={styles.bgGlow2} />
      </div>

      {/* ── Page header ─────────────────────── */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}><BookmarkIcon /></div>
            <div>
              <h1 className={styles.pageTitle}>My Watchlist</h1>
              <p className={styles.pageSubtitle}>
                {loading ? 'Loading…' : `${watchlist.length} ${watchlist.length === 1 ? 'movie' : 'movies'} saved`}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <div className={styles.searchWrapper}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                id="watchlistSearch"
                className={styles.searchInput}
                type="search"
                placeholder="Search your watchlist…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Search watchlist"
                disabled={loading}
              />
            </div>

            <div className={styles.sortWrapper}>
              <label htmlFor="watchlistSort" className={styles.sortLabel}>Sort by</label>
              <select
                id="watchlistSort"
                className={styles.sortSelect}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Sort watchlist"
                disabled={loading}
              >
                <option value="default">Default</option>
                <option value="rating">Rating ↓</option>
                <option value="title">Title A–Z</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ────────────────────── */}
      <main className={styles.main} id="watchlistMain">

        {/* Loading skeletons */}
        {loading && (
          <div className={styles.grid} aria-label="Loading movies" aria-busy="true">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className={styles.errorState} role="alert">
            <p>⚠️ Could not load movies: <strong>{error}</strong></p>
            <button className={styles.retryBtn} onClick={() => window.location.reload()}>
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && watchlist.length === 0 && <EmptyState />}

        {/* No search results */}
        {!loading && !error && watchlist.length > 0 && displayed.length === 0 && search && (
          <div className={styles.noResults} role="status">
            No movies matched "<strong>{search}</strong>"
          </div>
        )}

        {/* Movie grid */}
        {!loading && !error && displayed.length > 0 && (
          <div className={styles.grid} role="list" aria-label="Watchlist movies">
            {displayed.map((movie, index) => (
              <div
                key={movie.id}
                role="listitem"
                className={styles.cardDrop}
                style={{ animationDelay: `${index * 0.07}s` }}
              >
                <WatchlistCard2
                  movie={movie}
                  onRemove={handleRemove}
                  onMarkWatched={handleMarkWatched}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Toast ─────────────────────────────── */}
      <Toast message={toast.message} visible={toast.visible} />
    </div>
  )
}
