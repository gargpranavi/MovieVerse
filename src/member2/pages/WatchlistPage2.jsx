/* 
   MovieVerse – WatchlistPage2.jsx
   Member 2 | Watchlist Page
   Day 2 – TVMaze API  |  localStorage-backed

   localStorage keys
   
   "watchlist"         → Array of full TVMaze show objects
   "movieverse_watched"  → Array of shows marked as watched

   Default Shows
   
   6 popular TVMaze shows are ALWAYS seeded back into the watchlist
   on every page load — even after the user deletes or watches them.

   Flow
   
   Page load  →  fetch defaults  →  merge into localStorage  →  show grid
   Add show   →  saves to localStorage  →  survives refresh  
   Remove / Mark watched  →  localStorage updated immediately
   Refresh    →  defaults re-merged + user additions preserved  
*/

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import WatchlistCard2 from '../components/WatchlistCard2.jsx'
import EmptyState2     from '../components/EmptyState2.jsx'
import styles          from './WatchlistPage2.module.css'
import { shows } from '../../data/index.js'
import { useWatchlist } from '../../context/index.js'
import { useToast } from '../../components/common/Toast/index.js'

/* Default show IDs — these are always seeded back on refresh.
   IDs: Person of Interest, True Detective, Grimm,
        Supernatural, Vikings, Fargo
*/
const DEFAULT_SHOW_IDS = ["2", "5", "10", "19", "29", "32"]

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

  /* Local UI State */
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('default')

  /* On mount: seed default shows if needed */
  useEffect(() => {
    const removedSet = new Set(removedDefaults.map(String))
    const idsToFetch = DEFAULT_SHOW_IDS.filter(id => !removedSet.has(String(id)))
    if (idsToFetch.length === 0) return

    const defaults = shows.filter(show => idsToFetch.includes(show.id))
    const map = new Map(watchlist.map(s => [String(s.id), s]))
    let hasChanges = false
    defaults.forEach(show => {
      if (show?.id && !map.has(String(show.id))) {
        map.set(String(show.id), show)
        hasChanges = true
      }
    })

    if (hasChanges) {
      const defaultIdSet = new Set(DEFAULT_SHOW_IDS)
      const merged = [
        ...defaults.filter(s => s?.id && map.has(String(s.id))),
        ...[...map.values()].filter(s => !defaultIdSet.has(String(s.id))),
      ]
      setWatchlist(merged)
    }
  }, [removedDefaults])

  /* Remove show from watchlist */
  function handleRemove(id) {
    const show = watchlist.find(s => String(s.id) === String(id))
    removeFromWatchlist(id)
    info(`Removed '${show?.name || show?.title || 'show'}' from Watchlist`, { duration: 2800 })
  }

  /* Mark as watched (moves to watched list) */
  function handleMarkWatched(show) {
    markAsWatched(show)
    success(`✓ Marked '${show?.name || show?.title}' as Watched!`, { duration: 3200 })
  }

  /* Filtered + sorted watchlist */
  const displayed = watchlist
    .filter(s =>
      ((s.name || s.title) ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
      if (sortBy === 'title')  return ((a.name || a.title) ?? '').localeCompare((b.name || b.title) ?? '')
      return 0 // default = insertion order
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

        {/* Page header*/}
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

        {/* Main content */}
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
      </div>
    </DashboardLayout>
  )
}
