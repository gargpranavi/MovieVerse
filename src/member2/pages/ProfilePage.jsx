/*
   MovieVerse – ProfilePage.jsx
   Member 2 | Day 5 - Profile Page

   Route: /profile

   Refactored to use centralized AuthContext (useAuth) and
   WatchlistContext (useWatchlist) instead of raw localStorage calls.

   localStorage keys still read:
     "movieverse_reviews" → reviews (for count + display)
     "movieverse_ratings" → ratings (for avg rating)
   (Reviews/Ratings are not yet in global context — kept local for now)

   Sections:
     1. Profile Card  (avatar, name, stats)
     2. Recent Watched Movies
     3. User Reviews
*/

import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import DashboardLayout         from '../../components/layout/DashboardLayout.jsx'
import ProfileCard             from '../components/ProfileCard.jsx'
import styles                  from './ProfilePage.module.css'
import { useAuth }             from '../../context/index.js'
import { useWatchlist }        from '../../context/index.js'
import { useToast }            from '../../components/common/Toast/index.js'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectPreferences,
  updatePreferences,
  selectUser,
  selectWatchlistCount,
  selectWatchedCount,
} from '../../store/index.js'

/* localStorage helpers for reviews/ratings (not yet in context) */
const LS_REVIEWS = 'movieverse_reviews'
const LS_RATINGS = 'movieverse_ratings'

function loadLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

/* Compute average rating */
function computeAvgRating(ratings) {
  if (!ratings.length) return null
  const sum = ratings.reduce((acc, r) => acc + (r.rating ?? 0), 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

/* Resolve a show title from its ID */
function resolveTitle(movieId, watched, watchlist) {
  const id = String(movieId)
  const fromWatched   = watched.find(s   => String(s.id) === id)
  const fromWatchlist = watchlist.find(s  => String(s.id) === id)
  return (fromWatched?.name || fromWatched?.title) ?? (fromWatchlist?.name || fromWatchlist?.title) ?? `Show #${id}`
}

/* Inline icon components */

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

function StarFilledIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="0.5" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )
}

/* Small movie poster card */
function RecentMovieCard({ show }) {
  const name   = show?.name ?? show?.title ?? 'Unknown'
  const poster = (typeof show?.image === 'string' ? show.image : (show?.image?.medium || show?.image?.original)) || show?.poster || null
  const rating = show?.rating?.average ?? show?.userRating ?? show?.rating ?? null
  const date   = show?.watchedDate ?? show?.watchedAt ?? null
  const linkUrl = (show?.mediaType === 'tv' || (show?.source === 'tmdb' && show?.mediaType === 'tv'))
    ? `/movie/${show?.id}?type=tv`
    : `/movie/${show?.id}`

  return (
    <Link to={linkUrl} className={styles.recentCard} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className={styles.recentPoster}>
        {poster ? (
          <img src={poster} alt={name} className={styles.recentImg} />
        ) : (
          <div className={styles.recentImgFallback}>
            <EyeIcon />
          </div>
        )}
      </div>
      <div className={styles.recentInfo}>
        <p className={styles.recentTitle}>{name}</p>
        {rating !== null && (
          <span className={styles.recentRating}>
            <StarFilledIcon /> {typeof rating === 'number' ? rating.toFixed(1) : rating}
          </span>
        )}
        {date && <span className={styles.recentDate}>{date}</span>}
      </div>
    </Link>
  )
}

/* Single review row */
function ReviewRow({ review, title }) {
  return (
    <div className={styles.reviewRow}>
      <div className={styles.reviewMeta}>
        <span className={styles.reviewMovieId}>{title}</span>
        {review.rating && (
          <span className={styles.reviewRating}>
            <StarFilledIcon /> {review.rating}/5
          </span>
        )}
        <span className={styles.reviewDate}>{review.date}</span>
      </div>
      <p className={styles.reviewText}>{review.review}</p>
    </div>
  )
}

/* Main ProfilePage Component */
export default function ProfilePage() {

  // ── Global context ───────────────────────────────────────────────────────
  const { user } = useAuth()
  const { watchlist, watchedHistory: watched, watchlistCount, watchedCount } = useWatchlist()
  const { toast } = useToast()

  // ── Redux Global State (RTK) ──────────────────────────────────────────────
  const reduxDispatch = useDispatch()
  const reduxUser = useSelector(selectUser)
  const reduxPreferences = useSelector(selectPreferences)
  const reduxWatchlistCount = useSelector(selectWatchlistCount)
  const reduxWatchedCount = useSelector(selectWatchedCount)

  const handleTogglePref = (key) => {
    const currentVal = reduxPreferences?.[key]
    const nextVal = !currentVal
    reduxDispatch(updatePreferences({ [key]: nextVal }))
    toast.info(`Redux state updated: ${key} = ${nextVal ? 'ON' : 'OFF'}`)
  }

  // ── Local state for reviews/ratings (not yet in global context) ──────────
  const [reviews, setReviews] = useState([])
  const [ratings, setRatings] = useState([])

  /* Load reviews/ratings from localStorage and re-sync when updated */
  useEffect(() => {
    function refresh() {
      setReviews(loadLS(LS_REVIEWS))
      setRatings(loadLS(LS_RATINGS))
    }
    refresh()

    window.addEventListener('reviewsUpdated', refresh)
    window.addEventListener('ratingsUpdated', refresh)
    window.addEventListener('storage',        refresh)

    return () => {
      window.removeEventListener('reviewsUpdated', refresh)
      window.removeEventListener('ratingsUpdated', refresh)
      window.removeEventListener('storage',        refresh)
    }
  }, [])

  const avgRating = computeAvgRating(ratings)

  /* Most recent 6 watched shows */
  const recentWatched = [...watched]
    .sort((a, b) => (b.watchedDate ?? '').localeCompare(a.watchedDate ?? ''))
    .slice(0, 6)

  /* Most recent 5 reviews */
  const recentReviews = [...reviews].reverse().slice(0, 5)

  /* Render */
  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* Deep Space Background */}
        <div className={styles.bgScene} aria-hidden="true">
          <div className={styles.bgGlow1} />
          <div className={styles.bgGlow2} />
          <div className={styles.bgGlow3} />
          <div className={styles.bgGlow4} />
        </div>

        {/* Page header */}
        <header className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}><UserIcon /></div>
              <div>
                <h1 className={styles.pageTitle}>My Profile</h1>
                <p className={styles.pageSubtitle}>Your cinema journey at a glance</p>
              </div>
            </div>

            {/* Quick navigation links */}
            <nav className={styles.quickNav} aria-label="Quick navigation">
              <Link to="/watched"   className={styles.navLink} id="profile-nav-watched">
                <EyeIcon /> Watched
              </Link>
              <Link to="/watchlist" className={styles.navLink} id="profile-nav-watchlist">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                Watchlist
              </Link>
            </nav>
          </div>
        </header>

        {/* Main content */}
        <main className={styles.main} id="profileMain">

          {/* Two-column layout */}
          <div className={styles.layout}>

            {/* Left: Profile Card (sticky) */}
            <aside className={styles.leftCol}>
              <ProfileCard
                user           = {user}
                watchedCount   = {watchedCount}
                watchlistCount = {watchlistCount}
                reviewCount    = {reviews.length}
                avgRating      = {avgRating}
              />
            </aside>

            {/* Right: detail panels */}
            <section className={styles.rightCol}>

              {/* Recent Watched */}
              <div className={styles.panel} id="profile-recent-watched">
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleRow}>
                    <span className={styles.panelIcon}><EyeIcon /></span>
                    <h2 className={styles.panelTitle}>Recently Watched</h2>
                    <span className={styles.panelBadge}>{watched.length}</span>
                  </div>
                  {watched.length > 0 && (
                    <Link to="/watched" className={styles.panelLink}>View all →</Link>
                  )}
                </div>

                {watched.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><EyeIcon /></div>
                    <p className={styles.emptyText}>No movies watched yet.</p>
                    <Link to="/watchlist" className={styles.emptyAction}>
                      Go to Watchlist → Mark a show as watched
                    </Link>
                  </div>
                ) : (
                  <div className={styles.recentGrid}>
                    {recentWatched.map((show, i) => (
                      <div
                        key={show.id ?? i}
                        className={styles.recentCardDrop}
                        style={{ animationDelay: `${i * 0.07}s` }}
                      >
                        <RecentMovieCard show={show} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Reviews */}
              <div className={styles.panel} id="profile-reviews">
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleRow}>
                    <span className={styles.panelIcon}><PenIcon /></span>
                    <h2 className={styles.panelTitle}>My Reviews</h2>
                    <span className={styles.panelBadge}>{reviews.length}</span>
                  </div>
                </div>

                {reviews.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><PenIcon /></div>
                    <p className={styles.emptyText}>No reviews written yet.</p>
                    <Link to="/watchlist" className={styles.emptyAction}>
                      Go to Watchlist → Review a show
                    </Link>
                  </div>
                ) : (
                  <div className={styles.reviewList}>
                    {recentReviews.map((rev, i) => (
                      <div
                        key={rev.id ?? i}
                        className={styles.reviewRowDrop}
                        style={{ animationDelay: `${i * 0.07}s` }}
                      >
                        <ReviewRow
                          review={rev}
                          title={resolveTitle(rev.movieId, watched, watchlist)}
                        />
                      </div>
                    ))}
                    {reviews.length > 5 && (
                      <p className={styles.moreNote}>
                        + {reviews.length - 5} more review{reviews.length - 5 > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Ratings summary */}
              {ratings.length > 0 && (
                <div className={styles.panel} id="profile-ratings">
                  <div className={styles.panelHeader}>
                    <div className={styles.panelTitleRow}>
                      <span className={styles.panelIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="0.5" aria-hidden="true">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      </span>
                      <h2 className={styles.panelTitle}>Ratings</h2>
                      <span className={styles.panelBadge}>{ratings.length}</span>
                    </div>
                  </div>

                  <div className={styles.ratingsRow}>
                    {ratings.map((r, i) => (
                      <div key={r.movieId ?? i} className={styles.ratingChip}>
                        <span className={styles.ratingChipId}>
                          {resolveTitle(r.movieId, watched, watchlist)}
                        </span>
                        <span className={styles.ratingChipValue}>
                          <StarFilledIcon /> {r.rating}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Redux Global State Panel (Evaluation Ready) ── */}
              <div className={styles.panel} id="profile-redux-store" style={{ borderColor: 'rgba(118, 74, 188, 0.4)' }}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelTitleRow}>
                    <span className={styles.panelIcon} style={{ color: '#a855f7' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                      </svg>
                    </span>
                    <h2 className={styles.panelTitle} style={{ color: '#c084fc' }}>Redux Store State (RTK)</h2>
                    <span className={styles.panelBadge} style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
                      Active
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>Redux User</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>{reduxUser?.name || 'Guest'}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>Watchlist Count</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#f5c842' }}>{reduxWatchlistCount} items</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: '4px' }}>Watched Count</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8' }}>{reduxWatchedCount} items</div>
                  </div>
                </div>

                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>
                  <strong>Interactive Dispatch Actions (Click to dispatch to Redux Store):</strong>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => handleTogglePref('autoPlayTrailers')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: reduxPreferences?.autoPlayTrailers ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: reduxPreferences?.autoPlayTrailers ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                      color: reduxPreferences?.autoPlayTrailers ? '#c084fc' : '#aaa',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Auto-Play Trailers: {reduxPreferences?.autoPlayTrailers ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePref('compactView')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: reduxPreferences?.compactView ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: reduxPreferences?.compactView ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                      color: reduxPreferences?.compactView ? '#c084fc' : '#aaa',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Compact View: {reduxPreferences?.compactView ? 'ON' : 'OFF'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTogglePref('notifyOnRelease')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: reduxPreferences?.notifyOnRelease ? 'rgba(168, 85, 247, 0.25)' : 'rgba(255,255,255,0.05)',
                      border: reduxPreferences?.notifyOnRelease ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
                      color: reduxPreferences?.notifyOnRelease ? '#c084fc' : '#aaa',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    Notifications: {reduxPreferences?.notifyOnRelease ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

            </section>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
