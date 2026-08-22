/* =============================================
   MovieVerse – WatchlistPage2.jsx
   Member 2 | Watchlist Page
   Day 2 – TVMaze API  |  localStorage-backed

   localStorage keys
   ─────────────────
   "watchlist"         → Array of full TVMaze show objects
   "movieverse_watched"  → Array of shows marked as watched

   Default Shows
   ─────────────
   6 popular TVMaze shows are ALWAYS seeded back into the watchlist
   on every page load — even after the user deletes or watches them.

   Flow
   ────
   Page load  →  fetch defaults  →  merge into localStorage  →  show grid
   Add show   →  saves to localStorage  →  survives refresh  ✅
   Remove / Mark watched  →  localStorage updated immediately
   Refresh    →  defaults re-merged + user additions preserved  ✅
   ============================================= */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import WatchlistCard2 from '../components/WatchlistCard2.jsx'
import EmptyState2     from '../components/EmptyState2.jsx'
import styles          from './WatchlistPage2.module.css'

/* ── TVMaze API URLs (same as team) ──────────── */
const SHOWS_API  = 'https://api.tvmaze.com/shows'
const MOVIES_API = 'https://api.tvmaze.com/search/shows?q=movie'

/* ── localStorage keys ───────────────────────── */
const LS_WATCHLIST        = 'watchlist'           // shared key for all team members
const LS_WATCHED          = 'movieverse_watched'
const LS_REMOVED_DEFAULTS = 'movieverse_removed_defaults'  // tracks defaults user intentionally removed

/* ── Default show IDs (TVMaze) ───────────────────
   These 6 popular shows are ALWAYS restored on refresh.
   IDs: Person of Interest, True Detective, Grimm,
        Supernatural, Vikings, Fargo
   ─────────────────────────────────────────────── */
const DEFAULT_SHOW_IDS = [2, 5, 10, 19, 29, 32]

/* ══════════════════════════════════════════════
   localStorage helpers
   ══════════════════════════════════════════════ */

/** Load watchlist from localStorage (returns array of show objects) */
function loadWatchlist() {
  try {
    return JSON.parse(localStorage.getItem(LS_WATCHLIST) || '[]')
  } catch {
    return []
  }
}

/** Save watchlist to localStorage */
function saveWatchlist(list) {
  try {
    localStorage.setItem(LS_WATCHLIST, JSON.stringify(list))
  } catch { /* ignore */ }
}

/** Load watched list */
function loadWatched() {
  try {
    return JSON.parse(localStorage.getItem(LS_WATCHED) || '[]')
  } catch {
    return []
  }
}

/** Save watched list */
function saveWatched(list) {
  try {
    localStorage.setItem(LS_WATCHED, JSON.stringify(list))
  } catch { /* ignore */ }
}

/* ══════════════════════════════════════════════
   Inline SVG icons
   ══════════════════════════════════════════════ */

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
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

/* ── Toast notification ──────────────────────── */
function Toast({ message, visible }) {
  return (
    <div
      className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  )
}


/* ══════════════════════════════════════════════
   Main WatchlistPage2 Component
   ══════════════════════════════════════════════ */
export default function WatchlistPage2() {
  /* ── State ─────────────────────────────────── */
  const [watchlist,   setWatchlist]   = useState([])   // show objects
  const [search,      setSearch]      = useState('')
  const [sortBy,      setSortBy]      = useState('default')
  const [toast,       setToast]       = useState({ message: '', visible: false })

  /* ── On mount: fetch default shows + merge into watchlist ─
     Default shows are seeded once on first load.
     If the user removes a default show, it won't come back.
     User-added shows are always preserved.
     ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const existing = loadWatchlist()
    setWatchlist(existing)   // show saved items immediately

    // Load set of defaults the user has intentionally removed
    let removedDefaults
    try {
      removedDefaults = new Set(JSON.parse(localStorage.getItem(LS_REMOVED_DEFAULTS) || '[]'))
    } catch {
      removedDefaults = new Set()
    }

    // Only fetch defaults that haven't been removed by the user
    const idsToFetch = DEFAULT_SHOW_IDS.filter(id => !removedDefaults.has(id))
    if (idsToFetch.length === 0) return

    Promise.all(
      idsToFetch.map(id =>
        fetch(`https://api.tvmaze.com/shows/${id}`).then(r => r.json())
      )
    )
      .then(defaults => {
        setWatchlist(prev => {
          const map = new Map(prev.map(s => [s.id, s]))
          // Only insert defaults not already in the list
          defaults.forEach(show => {
            if (show?.id && !map.has(show.id)) map.set(show.id, show)
          })
          const defaultIdSet = new Set(DEFAULT_SHOW_IDS)
          const merged = [
            // Defaults first (in original order), then user-added
            ...defaults.filter(s => s?.id && map.has(s.id)),
            ...[...map.values()].filter(s => !defaultIdSet.has(s.id)),
          ]
          saveWatchlist(merged)
          return merged
        })
      })
      .catch(() => {
        setWatchlist(loadWatchlist())
      })
  }, [])

  /* ── Toast helper ─────────────────────────── */
  function showToast(msg) {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  /* ── Remove show from watchlist ───────────── */
  function handleRemove(id) {
    // If removing a default show, record it so it doesn't re-appear on refresh
    if (DEFAULT_SHOW_IDS.includes(id)) {
      try {
        const removed = new Set(JSON.parse(localStorage.getItem(LS_REMOVED_DEFAULTS) || '[]'))
        removed.add(id)
        localStorage.setItem(LS_REMOVED_DEFAULTS, JSON.stringify([...removed]))
      } catch { /* ignore */ }
    }
    setWatchlist(prev => {
      const updated = prev.filter(s => s.id !== id)
      saveWatchlist(updated)
      return updated
    })
    showToast('Removed from watchlist')
  }

  /* ── Mark as watched (moves to watched list) ── */
  function handleMarkWatched(show) {
    // Save to watched list
    const watched = loadWatched()
    if (!watched.some(s => s.id === show.id)) {
      saveWatched([
        ...watched,
        { ...show, watchedDate: new Date().toISOString().split('T')[0] }
      ])
    }
    // Remove from watchlist
    handleRemove(show.id)
    showToast('✓ Moved to Watched')
  }

  /* ── Filtered + sorted watchlist ─────────── */
  const displayed = watchlist
    .filter(s =>
      ((s.name || s.title) ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
      if (sortBy === 'title')  return ((a.name || a.title) ?? '').localeCompare((b.name || b.title) ?? '')
      return 0 // default = insertion order
    })


  /* ════════════════════════════════════════════
     Render
     ════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Deep Space Background ────────────── */}
        <div className={styles.bgScene} aria-hidden="true">
          <div className={styles.bgGlow1} />
          <div className={styles.bgGlow2} />
          <div className={styles.bgGlow3} />
        </div>

        {/* ── Page header ─────────────────────── */}
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}><BookmarkIcon /></div>
              <div>
                <h1 className={styles.pageTitle}>My Watchlist</h1>
                <p className={styles.pageSubtitle}>
                  {watchlist.length} {watchlist.length === 1 ? 'show' : 'shows'} saved
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
                >
                  <option value="default">Default</option>
                  <option value="rating">Rating ↓</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>

              {/* Navigation to Watched */}
              <Link to="/watched" className={styles.navBtn} title="View Watched Movies">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>Watched</span>
              </Link>

            </div>
          </div>
        </header>

        {/* ── Main content ──────────────────────── */}
        <main className={styles.main} id="watchlistMain">

          {/* Empty state */}
          {watchlist.length === 0 && <EmptyState2 />}

          {/* No search results */}
          {watchlist.length > 0 && displayed.length === 0 && search && (
            <div className={styles.noResults} role="status">
              No shows matched "<strong>{search}</strong>"
            </div>
          )}

          {/* Movie grid */}
          {displayed.length > 0 && (
            <div className={styles.grid} role="list" aria-label="Watchlist shows">
              {displayed.map((show, index) => (
                <div
                  key={show.id}
                  role="listitem"
                  className={styles.cardDrop}
                  style={{ animationDelay: `${index * 0.06}s` }}
                >
                  <WatchlistCard2
                    show={show}
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
    </DashboardLayout>
  )
}
