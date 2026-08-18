/* =============================================
   MovieVerse – WatchedPage2.jsx
   Member 2 | Watched Movies Page
   Day 3 – Watched Movies System

   localStorage keys
   ─────────────────
   "movieverse_watched"  → Array of watched show objects (each has .watchedDate)

   Flow
   ────
   /watchlist → Mark as Watched → moves show to "movieverse_watched" in localStorage
   /watched   → shows everything in "movieverse_watched"
   Refresh    → watched list auto-loaded from localStorage ✅
   Remove     → removed from "movieverse_watched" localStorage ✅
   ============================================= */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout   from '../../components/layout/DashboardLayout.jsx'
import WatchlistCard2    from '../components/WatchlistCard2.jsx'
import StatusBadge2      from '../components/StatusBadge2.jsx'
import EmptyState2       from '../components/EmptyState2.jsx'
import styles            from './WatchedPage2.module.css'

/* ── localStorage key ────────────────────────── */
const LS_WATCHED = 'movieverse_watched'

/* ══════════════════════════════════════════════
   localStorage helpers
   ══════════════════════════════════════════════ */
function loadWatched() {
  try {
    return JSON.parse(localStorage.getItem(LS_WATCHED) || '[]')
  } catch {
    return []
  }
}

function saveWatched(list) {
  try {
    localStorage.setItem(LS_WATCHED, JSON.stringify(list))
  } catch { /* ignore quota errors */ }
}

/* ══════════════════════════════════════════════
   Icon Components
   ══════════════════════════════════════════════ */
function EyeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

/* ══════════════════════════════════════════════
   Toast Component
   ══════════════════════════════════════════════ */
function Toast({ message, visible }) {
  return (
    <div className={`${styles.toast} ${visible ? styles.toastVisible : ''}`}
         role="status" aria-live="polite">
      {message}
    </div>
  )
}

/* ══════════════════════════════════════════════
   Main WatchedPage2 Component
   ══════════════════════════════════════════════ */
export default function WatchedPage2() {

  /* ── State ─────────────────────────────────── */
  const [watched,    setWatched]    = useState([])
  const [search,     setSearch]     = useState('')
  const [sortBy,     setSortBy]     = useState('date')   // date | rating | title
  const [toast,      setToast]      = useState({ message: '', visible: false })

  /* ── On mount: load watched list from localStorage ── */
  useEffect(() => {
    setWatched(loadWatched())
  }, [])

  /* ── Toast helper ─────────────────────────── */
  function showToast(msg) {
    setToast({ message: msg, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 2800)
  }

  /* ── Remove from watched list ─────────────── */
  function handleRemove(id) {
    setWatched(prev => {
      const updated = prev.filter(s => s.id !== id)
      saveWatched(updated)                  // ← localStorage.setItem
      return updated
    })
    showToast('Removed from Watched')
  }

  /* ── Filtered + sorted watched list ──────── */
  const displayed = watched
    .filter(s =>
      (s.name ?? '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating?.average ?? 0) - (a.rating?.average ?? 0)
      if (sortBy === 'title')  return (a.name ?? '').localeCompare(b.name ?? '')
      // 'date' → most recently watched first
      if (sortBy === 'date')   return (b.watchedDate ?? '').localeCompare(a.watchedDate ?? '')
      return 0
    })

  /* ════════════════════════════════════════════
     Render
     ════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Ambient background ──────────────── */}
        <div className={styles.bgScene} aria-hidden="true">
          <div className={styles.bgGlow1} />
          <div className={styles.bgGlow2} />
        </div>

        {/* ── Page header ─────────────────────── */}
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>

            {/* Left: icon + title */}
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}><EyeIcon /></div>
              <div>
                <h1 className={styles.pageTitle}>Watched Movies</h1>
                <p className={styles.pageSubtitle}>
                  {watched.length} {watched.length === 1 ? 'show' : 'shows'} watched
                </p>
              </div>
            </div>

            {/* Right: controls */}
            <div className={styles.controls}>

              {/* Search */}
              <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}><SearchIcon /></span>
                <input
                  id="watchedSearch"
                  className={styles.searchInput}
                  type="search"
                  placeholder="Search watched…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search watched movies"
                />
              </div>

              {/* Sort */}
              <div className={styles.sortWrapper}>
                <label htmlFor="watchedSort" className={styles.sortLabel}>Sort by</label>
                <select
                  id="watchedSort"
                  className={styles.sortSelect}
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  aria-label="Sort watched movies"
                >
                  <option value="date">Date Watched ↓</option>
                  <option value="rating">Rating ↓</option>
                  <option value="title">Title A–Z</option>
                </select>
              </div>

              {/* Navigation to Watchlist */}
              <Link to="/watchlist" className={styles.navBtn} title="Back to Watchlist">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span>Watchlist</span>
              </Link>

            </div>
          </div>
        </header>

        {/* ── Stats bar ─────────────────────────── */}
        {watched.length > 0 && (
          <div className={styles.statsBar}>
            <span className={styles.statItem}>
              <StatusBadge2 type="watched" size="md" label={`${watched.length} Watched`} />
            </span>
            {watched.filter(s => s.status === 'Running').length > 0 && (
              <span className={styles.statItem}>
                <StatusBadge2
                  type="running"
                  size="md"
                  label={`${watched.filter(s => s.status === 'Running').length} Still Airing`}
                />
              </span>
            )}
          </div>
        )}

        {/* ── Main content ──────────────────────── */}
        <main className={styles.main} id="watchedMain">

          {/* Empty state — nothing watched yet */}
          {watched.length === 0 && (
            <div className={styles.emptyWrapper}>
              <div className={styles.emptyIconRing}>
                <EyeIcon />
              </div>
              <h2 className={styles.emptyHeading}>Nothing watched yet!</h2>
              <p className={styles.emptySub}>
                Go to your <a href="/watchlist" className={styles.emptyLink}>Watchlist</a> and
                click the ✓ button on any show to mark it as watched.
              </p>
            </div>
          )}

          {/* No search results */}
          {watched.length > 0 && displayed.length === 0 && search && (
            <div className={styles.noResults} role="status">
              No watched shows matched "<strong>{search}</strong>"
            </div>
          )}

          {/* Watched grid */}
          {displayed.length > 0 && (
            <div className={styles.grid} role="list" aria-label="Watched shows">
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
                    removeLabel="Remove from Watched"
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
