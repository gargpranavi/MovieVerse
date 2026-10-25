/*
   MovieVerse – WatchlistPage2.jsx
   Member 2 | Watchlist Page
   Day 2 – TVMaze API | localStorage-backed
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import WatchlistCard2 from '../components/WatchlistCard2.jsx'
import EmptyState2 from '../components/EmptyState2.jsx'
import styles from './WatchlistPage2.module.css'
import { shows } from '../../data/index.js'
import { useWatchlist } from '../../context/index.js'
import { useToast } from '../../components/common/Toast/index.js'

/* Default show IDs. Removed defaults are remembered so they do not return. */
const DEFAULT_SHOW_IDS = ['2', '5', '10', '19', '29', '32']
const LS_REMOVED_DEFAULTS = 'movieverse_removed_defaults'

/* Inline SVG icons */
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

/* Main WatchlistPage2 Component */
export default function WatchlistPage2() {
  const {
    watchlist,
    removeFromWatchlist,
    markAsWatched,
    setWatchlist,
    removedDefaults,
  } = useWatchlist()
  const { success, info } = useToast()

  /* Local UI state */
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  /* Seed default shows once, respecting removals, and keep context in sync */
  useEffect(() => {
    const syncWatchlist = () => {
      setWatchlist(current => {
        // The context is the source of truth; update only when local storage differs.
        let stored = []
        try {
          stored = JSON.parse(localStorage.getItem('watchlist') || '[]')
        } catch {
          stored = []
        }
        return Array.isArray(stored) ? stored : current
      })
    }

    let storedRemoved = []
    try {
      storedRemoved = JSON.parse(localStorage.getItem(LS_REMOVED_DEFAULTS) || '[]')
    } catch {
      storedRemoved = []
    }

    const removedSet = new Set([
      ...storedRemoved.map(String),
      ...(Array.isArray(removedDefaults) ? removedDefaults.map(String) : []),
    ])
    const idsToSeed = DEFAULT_SHOW_IDS.filter(id => !removedSet.has(String(id)))
    const defaults = shows.filter(show => idsToSeed.includes(String(show.id)))
    const map = new Map(watchlist.map(show => [String(show.id), show]))
    let changed = false

    defaults.forEach(show => {
      if (show?.id != null && !map.has(String(show.id))) {
        map.set(String(show.id), show)
        changed = true
      }
    })

    if (changed) {
      const merged = [...map.values()]
      setWatchlist(merged)
    }

    window.addEventListener('watchlistUpdated', syncWatchlist)
    return () => window.removeEventListener('watchlistUpdated', syncWatchlist)
  // Context methods are expected to be stable; this runs once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* Remove show from watchlist */
  function handleRemove(id) {
    const show = watchlist.find(item => String(item.id) === String(id))

    if (DEFAULT_SHOW_IDS.includes(String(id))) {
      try {
        const removed = new Set(JSON.parse(localStorage.getItem(LS_REMOVED_DEFAULTS) || '[]').map(String))
        removed.add(String(id))
        localStorage.setItem(LS_REMOVED_DEFAULTS, JSON.stringify([...removed]))
      } catch {
        // Ignore storage errors; still remove through context.
      }
    }

    removeFromWatchlist(id)
    info(`Removed '${show?.name || show?.title || 'show'}' from Watchlist`, {
      duration: 2800,
    })
  }

  /* Mark as watched (moves to watched list) */
  function handleMarkWatched(show) {
    markAsWatched(show)
    success(`✓ Marked '${show?.name || show?.title || 'show'}' as Watched!`, {
      duration: 3200,
    })
  }

  /* Filtered + sorted watchlist */
  const displayed = watchlist
    .filter(show =>
      ((show.name || show.title) ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.rating?.average ?? b.userRating ?? 0) -
          (a.rating?.average ?? a.userRating ?? 0)
      }
      if (sortBy === 'title') {
        return ((a.name || a.title) ?? '').localeCompare((b.name || b.title) ?? '')
      }
      return 0
    })

  /* Render */
  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* Deep Space Background */}
        <div className={styles.bgScene} aria-hidden="true">
          <div className={styles.bgGlow1} />
          <div className={styles.bgGlow2} />
          <div className={styles.bgGlow3} />
        </div>

        {/* Page header */}
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

        {/* Main content */}
        <main className={styles.main} id="watchlistMain">
          {watchlist.length === 0 && <EmptyState2 />}

          {watchlist.length > 0 && displayed.length === 0 && search && (
            <div className={styles.noResults} role="status">
              No shows matched "<strong>{search}</strong>"
            </div>
          )}

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
      </div>
    </DashboardLayout>
  )
}