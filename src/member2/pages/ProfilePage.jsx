/* =============================================
   MovieVerse – ProfilePage.jsx
   Member 2 | Day 5 — Profile Page

   Route: /profile

   localStorage keys read:
     "watchlist"          → watchlist items (for count)
     "movieverse_watched" → watched items (for count + recent)
     "movieverse_reviews" → reviews (for count + display)
     "movieverse_ratings" → ratings (for avg rating)

   Sections:
     1. Profile Card  (avatar, name, stats)
     2. Recent Watched Movies
     3. User Reviews
   ============================================= */

import { useState, useEffect } from 'react'
import { Link }                from 'react-router-dom'
import DashboardLayout         from '../../components/layout/DashboardLayout.jsx'
import ProfileCard             from '../components/ProfileCard.jsx'
import { mockUsers }           from '../data/users2.js'
import styles                  from './ProfilePage.module.css'

/* ── localStorage keys ───────────────────────── */
const LS_WATCHLIST = 'watchlist'
const LS_WATCHED   = 'movieverse_watched'
const LS_REVIEWS   = 'movieverse_reviews'
const LS_RATINGS   = 'movieverse_ratings'

/* ── localStorage helpers ────────────────────── */
function loadLS(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

/* ── Compute average rating ──────────────────── */
function computeAvgRating(ratings) {
  if (!ratings.length) return null
  const sum = ratings.reduce((acc, r) => acc + (r.rating ?? 0), 0)
  return Math.round((sum / ratings.length) * 10) / 10
}

/* ══════════════════════════════════════════════
   Inline icon components
   ══════════════════════════════════════════════ */

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

/* ── Small movie poster card ─────────────────── */
function RecentMovieCard({ show }) {
  const name   = show?.name ?? show?.title ?? 'Unknown'
  const poster = show?.image?.medium ?? null
  const rating = show?.rating?.average ?? show?.userRating ?? null
  const date   = show?.watchedDate ?? null

  return (
    <div className={styles.recentCard}>
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
    </div>
  )
}

/* ── Single review row ───────────────────────── */
function ReviewRow({ review }) {
  return (
    <div className={styles.reviewRow}>
      <div className={styles.reviewMeta}>
        <span className={styles.reviewMovieId}>Show #{review.movieId}</span>
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

/* ══════════════════════════════════════════════
   Main ProfilePage Component
   ══════════════════════════════════════════════ */
export default function ProfilePage() {

  /* ── State ───────────────────────────────── */
  const [watchlist,    setWatchlist]    = useState([])
  const [watched,      setWatched]      = useState([])
  const [reviews,      setReviews]      = useState([])
  const [ratings,      setRatings]      = useState([])

  /* ── Load all data from localStorage ─────── */
  useEffect(() => {
    function refresh() {
      setWatchlist(loadLS(LS_WATCHLIST))
      setWatched  (loadLS(LS_WATCHED))
      setReviews  (loadLS(LS_REVIEWS))
      setRatings  (loadLS(LS_RATINGS))
    }
    refresh()

    /* Re-sync if other pages update data */
    window.addEventListener('reviewsUpdated', refresh)
    window.addEventListener('ratingsUpdated', refresh)
    window.addEventListener('storage',        refresh)

    return () => {
      window.removeEventListener('reviewsUpdated', refresh)
      window.removeEventListener('ratingsUpdated', refresh)
      window.removeEventListener('storage',        refresh)
    }
  }, [])

  /* ── Derived values ──────────────────────── */
  const user       = mockUsers[0]
  const avgRating  = computeAvgRating(ratings)

  /* Most recent 6 watched shows */
  const recentWatched = [...watched]
    .sort((a, b) => (b.watchedDate ?? '').localeCompare(a.watchedDate ?? ''))
    .slice(0, 6)

  /* Most recent 5 reviews */
  const recentReviews = [...reviews].reverse().slice(0, 5)

  /* ════════════════════════════════════════════
     Render
     ════════════════════════════════════════════ */
  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Deep Space Background ──────────── */}
        <div className={styles.bgScene} aria-hidden="true">
          <div className={styles.bgGlow1} />
          <div className={styles.bgGlow2} />
          <div className={styles.bgGlow3} />
          <div className={styles.bgGlow4} />
        </div>

        {/* ── Page header ────────────────────── */}
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

        {/* ── Main content ───────────────────── */}
        <main className={styles.main} id="profileMain">

          {/* ── Two-column layout ──────────── */}
          <div className={styles.layout}>

            {/* Left: Profile Card (sticky) */}
            <aside className={styles.leftCol}>
              <ProfileCard
                user           = {user}
                watchedCount   = {watched.length}
                watchlistCount = {watchlist.length}
                reviewCount    = {reviews.length}
                avgRating      = {avgRating}
              />
            </aside>

            {/* Right: detail panels */}
            <section className={styles.rightCol}>

              {/* ── Recent Watched ───────────── */}
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

              {/* ── User Reviews ─────────────── */}
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
                        <ReviewRow review={rev} />
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

              {/* ── Ratings summary ──────────── */}
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
                        <span className={styles.ratingChipId}>#{r.movieId}</span>
                        <span className={styles.ratingChipValue}>
                          <StarFilledIcon /> {r.rating}/5
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </section>
          </div>
        </main>
      </div>
    </DashboardLayout>
  )
}
