import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import { isWatched, addToWatched, removeFromWatched, getWatchedDate } from '../../utils/watched.js'
import { getUserRating, getUserReview, saveUserRating, saveUserReview } from '../../utils/reviews.js'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import { shows, castByShowId, people } from '../../data/index.js'
import {
  fetchMovieDetails,
  fetchTvDetails,
  fetchMovieCredits,
} from '../../member2/services/tmdbApi.js'
// Member 3: Tab navigation component
import MovieDetailsTabs from '../../member3/components/MovieDetailsTabs/MovieDetailsTabs.jsx'
// Member 3: Community review components
import CommunityReviewForm from '../../member3/components/CommunityReviewForm/CommunityReviewForm.jsx'
import CommunityReviewsList from '../../member3/components/CommunityReviewsList/CommunityReviewsList.jsx'
import { getReviewsForMovie } from '../../member3/utils/communityReviews.js'
import styles from './MovieDetailsPage.module.css'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
}

function StarIcon({ filled, onClick, style }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ color: filled ? 'var(--gold-mid, #D4A017)' : '#555', cursor: onClick ? 'pointer' : 'default', ...style }}
      onClick={onClick}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

const FALLBACK_POSTER  = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80'
const FALLBACK_PERSON  = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'

export default function MovieDetailsPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const location   = useLocation()

  // ── Determine if this is a TMDB ID ────────────────────────────────────────
  const isTmdbId       = id?.startsWith('tmdb-')
  const tmdbNumericId  = isTmdbId ? id.replace('tmdb-', '') : null

  // Read mediaType from ?type=tv query param (set by MovieCard for TV shows)
  const searchParams   = new URLSearchParams(location.search)
  const mediaTypeParam = searchParams.get('type') || 'movie'   // default: movie

  // ── Local data (for non-TMDB IDs) ─────────────────────────────────────────
  const localMovie = !isTmdbId ? (shows.find(s => s.id === id) || null) : null
  const localCast  = !isTmdbId ? (castByShowId[id] || []) : []
  const localRecs  = !isTmdbId && localMovie
    ? shows
        .filter(s => s.id !== id)
        .filter(s =>
          s.genres.some(g => localMovie.genres?.includes(g)) ||
          Math.abs((s.rating || 8) - (localMovie.rating || 8)) < 1.5
        )
        .slice(0, 4)
        .map(s => ({
          id:     s.id,
          title:  s.title,
          year:   s.year,
          genres: s.genres,
          image:  s.image || FALLBACK_POSTER,
          rating: s.rating,
        }))
    : []

  // ── TMDB async state ───────────────────────────────────────────────────────
  const [tmdbMovie,   setTmdbMovie]   = useState(null)
  const [tmdbCast,    setTmdbCast]    = useState([])
  const [tmdbLoading, setTmdbLoading] = useState(isTmdbId)
  const [tmdbError,   setTmdbError]   = useState(null)

  useEffect(() => {
    if (!isTmdbId || !tmdbNumericId) return

    let cancelled = false
    setTmdbLoading(true)
    setTmdbMovie(null)
    setTmdbCast([])
    setTmdbError(null)

    async function loadTmdb() {
      // Choose endpoint from ?type= param
      const detailFn = mediaTypeParam === 'tv' ? fetchTvDetails : fetchMovieDetails
      const result   = await detailFn(tmdbNumericId)

      if (cancelled) return

      if (result.success && result.data.length > 0) {
        setTmdbMovie(result.data[0])

        // Fetch credits for movies (TV credits require a different endpoint — skip for now)
        if (mediaTypeParam !== 'tv') {
          const credits = await fetchMovieCredits(tmdbNumericId)
          if (!cancelled && credits.success) {
            setTmdbCast(credits.data)
          }
        }
      } else {
        setTmdbError(result.error || 'Could not load details for this title.')
      }

      if (!cancelled) setTmdbLoading(false)
    }

    loadTmdb()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // ── Unified movie + cast (local or TMDB) ───────────────────────────────────
  const movie = isTmdbId ? tmdbMovie  : localMovie
  const cast  = isTmdbId ? tmdbCast   : localCast
  const recommendations = isTmdbId ? [] : localRecs   // TMDB recs would need extra API call

  // ── User interaction state ────────────────────────────────────────────────
  const [inWatchlist,  setInWatchlist]  = useState(false)
  const [watchedState, setWatchedState] = useState(false)
  const [watchedDate,  setWatchedDate]  = useState(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  // Rating & Review State (existing single-user review from utils/reviews.js)
  const [userRating,       setUserRating]       = useState(0)
  const [reviewText,       setReviewText]        = useState('')
  const [savedReview,      setSavedReview]       = useState(null)
  const [isReviewFormOpen, setIsReviewFormOpen]  = useState(false)

  // Actor Modal State
  const [selectedActor,        setSelectedActor]        = useState(null)
  const [actorDetailsLoading,  setActorDetailsLoading]  = useState(false)
  const [showAllCast,          setShowAllCast]          = useState(false)

  // ── Member 3: Active tab state (default to Overview) ──────────────────────
  const [activeTab, setActiveTab] = useState('overview')

  // ── Member 3: Community reviews state ─────────────────────────────────────
  const [communityReviews, setCommunityReviews] = useState([])

  // Load community reviews from localStorage whenever movie changes
  useEffect(() => {
    if (!movie) return
    setCommunityReviews(getReviewsForMovie(movie.id))
  }, [movie, id])

  // Refresh community reviews list after a new review is added
  const handleReviewAdded = () => {
    if (movie) setCommunityReviews(getReviewsForMovie(movie.id))
  }

  // Initialise user-state from localStorage when movie loads or changes
  useEffect(() => {
    if (!movie) return
    setInWatchlist(isInWatchlist(movie.id))
    setWatchedState(isWatched(movie.id))
    setWatchedDate(getWatchedDate(movie.id))
    setUserRating(getUserRating(movie.id))

    const review = getUserReview(movie.id)
    if (review) {
      setSavedReview(review)
      setReviewText(review.reviewText)
    } else {
      setSavedReview(null)
      setReviewText('')
    }
  }, [movie, id])

  // Sync watchlist & watched badges in real time
  useEffect(() => {
    if (!movie) return
    const handleWl = () => setInWatchlist(isInWatchlist(movie.id))
    const handleWd = () => {
      setWatchedState(isWatched(movie.id))
      setWatchedDate(getWatchedDate(movie.id))
    }
    window.addEventListener('watchlistUpdated', handleWl)
    window.addEventListener('watchedUpdated',   handleWd)
    return () => {
      window.removeEventListener('watchlistUpdated', handleWl)
      window.removeEventListener('watchedUpdated',   handleWd)
    }
  }, [movie])

  // ── Loading state (TMDB fetch in progress) ────────────────────────────────
  if (tmdbLoading) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '80vh', gap: '20px', color: 'white',
        }}>
          <div style={{
            width: '48px', height: '48px',
            border: '4px solid rgba(255,255,255,0.15)',
            borderTop: '4px solid #D4A017',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
            Loading details…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </DashboardLayout>
    )
  }

  // ── TMDB error state ──────────────────────────────────────────────────────
  if (isTmdbId && tmdbError && !movie) {
    return (
      <DashboardLayout>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '80vh', color: 'white', gap: '16px',
        }}>
          <span style={{ fontSize: '2.5rem' }}>⚠️</span>
          <h2>Could not load details</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', textAlign: 'center' }}>
            {tmdbError}
          </p>
          <button className={styles.backBtn} onClick={() => navigate(-1)}>
            <ArrowLeftIcon /> Go Back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  // ── Not found (local ID) ──────────────────────────────────────────────────
  if (!movie) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'white', gap: '20px' }}>
          <h2>Movie not found!</h2>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeftIcon /> Go Back</button>
        </div>
      </DashboardLayout>
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleWatchlistToggle = () => toggleWatchlist(movie)

  const handleWatchedToggle = () => {
    if (watchedState) {
      removeFromWatched(movie.id)
      setWatchedState(false)
      setWatchedDate(null)
    } else {
      const today   = new Date()
      const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      addToWatched(movie, dateStr)
      setWatchedState(true)
      setWatchedDate(dateStr)
    }
  }

  const handleRatingClick = (rate) => {
    setUserRating(rate)
    saveUserRating(movie.id, rate)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    saveUserReview(movie.id, reviewText, movie.title)
    setSavedReview({
      reviewText,
      reviewDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    })
    setIsReviewFormOpen(false)
  }

  // Actor click — all data is already embedded in cast records (fully offline)
  const handleActorClick = (personId, name) => {
    setActorDetailsLoading(true)
    const castEntry = cast.find(c => c.person.id === personId)
    const localPerson = people[personId]

    const actorData = {
      id:      personId,
      name,
      image:   castEntry?.person?.image?.medium || localPerson?.image || FALLBACK_PERSON,
      birthday: castEntry?.person?.birthday || localPerson?.birthday || null,
      country:  castEntry?.person?.country  || localPerson?.country  || 'Unknown',
      gender:   castEntry?.person?.gender   || localPerson?.gender   || 'Unknown',
      knownFor: localPerson ? `${Object.values(castByShowId).filter(castArr => castArr.some(c => c.person.id === personId)).length} credits` : 'Actor',
    }
    setSelectedActor(actorData)
    setActorDetailsLoading(false)
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Back to Browse
        </button>

        {/* ── Hero section: Poster + core details (always visible) ── */}
        <div className={styles.contentWrapper}>
          {/* Poster with play overlay */}
          <div className={styles.posterSection}>
            <div className={styles.glowCard} onClick={() => setIsPlayerOpen(true)}>
              <img src={movie.image || FALLBACK_POSTER} alt={movie.title} className={styles.posterImage} />
              <div className={styles.playOverlay}>
                <div className={styles.playCircle}>
                  <PlayIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.detailsSection}>
            <h1 className={styles.title}>{movie.title}</h1>
            
            {/* Inline meta: year • rating • genres */}
            <div className={styles.metaRow}>
              <span>{movie.year}</span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.ratingBadge}>{movie.ageRating}</span>
              {movie.duration && (
                <>
                  <span className={styles.metaDot}>•</span>
                  <span>{movie.duration}</span>
                </>
              )}
              {movie.genres.length > 0 && (
                <>
                  <span className={styles.metaDot}>·</span>
                  {movie.genres.map((genre, i) => (
                    <span key={genre}>
                      <Link to={`/home?genre=${encodeURIComponent(genre)}`} className={styles.genreTagInline}>
                        {genre}
                      </Link>
                      {i < movie.genres.length - 1 && <span style={{color:'rgba(212,160,23,0.4)', margin:'0 2px'}}>,</span>}
                    </span>
                  ))}
                </>
              )}
            </div>

            <p className={styles.description}>{movie.description}</p>

            {/* Info cells with icons */}
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Language</span>
                  <Link to={`/home?language=${encodeURIComponent(movie.language)}`} className={styles.clickableLink}>
                    {movie.language || 'English'}
                  </Link>
                </div>
              </div>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="15" rx="2"/>
                    <polyline points="17 2 12 7 7 2"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Network</span>
                  <Link to={`/home?network=${encodeURIComponent(movie.network)}`} className={styles.clickableLink}>
                    {movie.network}
                  </Link>
                </div>
              </div>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Status</span>
                  <Link to={`/home?status=${encodeURIComponent(movie.status)}`} className={styles.clickableLink}>
                    {movie.status}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Action buttons — full width (always visible) */}
        <div className={styles.actionRow}>
          <button className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
            <PlayIcon /> Play Now
          </button>
          <button 
            className={styles.btnWatchlist}
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? <CheckIcon /> : <PlusIcon />}
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
          <button 
            className={`${styles.btnWatched} ${watchedState ? styles.btnWatchedActive : ''}`}
            onClick={handleWatchedToggle}
          >
            <CheckIcon />
            {watchedState ? 'Watched' : 'Mark as Watched'}
          </button>
        </div>

        {watchedState && watchedDate && (
          <div className={styles.watchedLabel}>
            ✓ Watched: {watchedDate}
          </div>
        )}

        {/* ── Member 3: Four-tab navigation ─────────────────────────────────── */}
        <MovieDetailsTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* ── Tab Panel: Overview ─────────────────────────────────────────── */}
        <div
          id="details-panel-overview"
          role="tabpanel"
          aria-labelledby="details-tab-overview"
          hidden={activeTab !== 'overview'}
        >
          {activeTab === 'overview' && (
            <div className={styles.ratingsCard}>
              {/* Left: Stars (your personal rating) */}
              <div className={styles.ratingHalf}>
                <div className={styles.ratingStarsTitle}>Your Rating</div>
                <div className={styles.starsWrapper}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon 
                      key={star} 
                      filled={star <= userRating} 
                      onClick={() => handleRatingClick(star)} 
                    />
                  ))}
                  {userRating > 0 && (
                    <span className={styles.ratingNumeric} style={{marginLeft: '8px'}}>{userRating}.0/5</span>
                  )}
                </div>
                {userRating > 0 && (
                  <div className={styles.ratingLabelText}>You rated this {userRating}/5</div>
                )}
              </div>

              {/* Right: Your personal review (existing feature) */}
              <div className={styles.reviewHalf}>
                <div className={styles.reviewHalfHeader}>
                  <div className={styles.ratingStarsTitle}>Your Review</div>
                  {savedReview && (
                    <span className={styles.reviewDate}>{savedReview.reviewDate}</span>
                  )}
                </div>
                {savedReview ? (
                  <>
                    <p className={styles.userReviewText}>&quot;{savedReview.reviewText}&quot;</p>
                    <button className={styles.btnWriteReview} onClick={() => setIsReviewFormOpen(true)}>
                      ✏️ Edit Review
                    </button>
                  </>
                ) : (
                  <button className={styles.btnWriteReview} onClick={() => setIsReviewFormOpen(true)}>
                    💬 Write a Review
                  </button>
                )}
                {isReviewFormOpen && (
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <label className={styles.formTitle}>
                      What did you think about {movie.title}?
                    </label>
                    <textarea 
                      className={styles.reviewInput} 
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      required
                    />
                    <div className={styles.formActions}>
                      <button type="submit" className={styles.submitReviewBtn}>Submit Review</button>
                      <button 
                        type="button" 
                        className={styles.cancelReviewBtn} 
                        onClick={() => setIsReviewFormOpen(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Similar Titles / You Might Also Like (in Overview) */}
          {activeTab === 'overview' && recommendations.length > 0 && (
            <section className={styles.recommendationsSection} style={{marginTop: '24px'}}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>You Might Also Like</h2>
              </div>
              <div className={styles.recommendationsGrid}>
                {recommendations.map((rec) => (
                  <div key={rec.id} className={styles.recCard} onClick={() => navigate(`/movie/${rec.id}`)}>
                    <img
                      src={rec.image || FALLBACK_POSTER}
                      alt={rec.title}
                      className={styles.recImage}
                      onError={(e) => { e.target.src = FALLBACK_POSTER }}
                    />
                    <div className={styles.recInfo}>
                      <div className={styles.recTitle}>{rec.title}</div>
                      <div className={styles.recMeta}>{rec.year} • ★ {rec.rating}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ── Tab Panel: Cast & Crew ──────────────────────────────────────── */}
        <div
          id="details-panel-cast"
          role="tabpanel"
          aria-labelledby="details-tab-cast"
          hidden={activeTab !== 'cast'}
        >
          {activeTab === 'cast' && cast.length > 0 && (
            <section className={styles.castSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionHeading}>Cast &amp; Crew</h2>
                {cast.length > 7 && (
                  <button
                    className={styles.viewAllBtn}
                    onClick={() => setShowAllCast(prev => !prev)}
                  >
                    {showAllCast ? 'Show Less' : `View All (${cast.length})`}
                    <svg
                      width="16" height="16" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      style={{ transform: showAllCast ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                    >
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </button>
                )}
              </div>
              <div className={styles.castGrid}>
                {(showAllCast ? cast : cast.slice(0, 7)).map((item) => (
                  <div 
                    key={item.person.id} 
                    className={styles.castCard} 
                    onClick={() => handleActorClick(item.person.id, item.person.name)}
                  >
                    <img 
                      src={item.person.image?.medium || FALLBACK_PERSON} 
                      alt={item.person.name} 
                      className={styles.castImage}
                      onError={(e) => { e.target.src = FALLBACK_PERSON }}
                    />
                    <div className={styles.castInfo}>
                      <div className={styles.actorName}>{item.person.name}</div>
                      <div className={styles.characterName}>{item.character.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
          {activeTab === 'cast' && cast.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px', fontFamily: 'Outfit, sans-serif' }}>
              No cast information available for this title.
            </div>
          )}
        </div>

        {/* ── Tab Panel: Trailers & Media ─────────────────────────────────── */}
        <div
          id="details-panel-trailers"
          role="tabpanel"
          aria-labelledby="details-tab-trailers"
          hidden={activeTab !== 'trailers'}
        >
          {activeTab === 'trailers' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 className={styles.sectionHeading} style={{marginBottom: '16px'}}>Trailers &amp; Media</h2>
              {/* Play trailer button — opens the existing VideoPlayerModal */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '32px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px',
                textAlign: 'center',
              }}>
                <div style={{
                  width: '80px', height: '80px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(212,160,23,0.2), rgba(212,160,23,0.08))',
                  border: '2px solid rgba(212,160,23,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }} onClick={() => setIsPlayerOpen(true)}>
                  <PlayIcon />
                </div>
                <div>
                  <p style={{ fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
                    Watch: {movie.title}
                  </p>
                  <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
                    Click to open the video player
                  </p>
                </div>
                <button className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
                  <PlayIcon /> Play Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Panel: User Reviews & Ratings ──────────────────────────── */}
        <div
          id="details-panel-reviews"
          role="tabpanel"
          aria-labelledby="details-tab-reviews"
          hidden={activeTab !== 'reviews'}
        >
          {activeTab === 'reviews' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Member 3: Community review form */}
              <CommunityReviewForm
                movieId={movie.id}
                onReviewAdded={handleReviewAdded}
              />
              {/* Member 3: List of community reviews */}
              <div>
                <h2 className={styles.sectionHeading} style={{marginBottom: '20px'}}>
                  Community Reviews
                </h2>
                <CommunityReviewsList reviews={communityReviews} />
              </div>
            </div>
          )}
        </div>

        {/* Actor Detail Modal (unchanged from original) */}
        {selectedActor && (
          <div className={styles.actorModalOverlay} onClick={() => setSelectedActor(null)}>
            <div className={styles.actorModal} onClick={(e) => e.stopPropagation()}>
              <button className={styles.actorModalClose} onClick={() => setSelectedActor(null)}>
                <CloseIcon />
              </button>
              {actorDetailsLoading ? (
                <div className={styles.actorLoading}>Loading...</div>
              ) : (
                <div className={styles.actorModalContent}>
                  <img 
                    src={selectedActor.image || FALLBACK_PERSON} 
                    alt={selectedActor.name}
                    className={styles.actorModalImage}
                    onError={(e) => { e.target.src = FALLBACK_PERSON }}
                  />
                  <div className={styles.actorModalDetails}>
                    <h3 className={styles.actorModalName}>{selectedActor.name}</h3>
                    <div className={styles.actorDetailGrid}>
                      {selectedActor.birthday && (
                        <div className={styles.actorDetailItem}>
                          <span className={styles.actorDetailLabel}>Birthday</span>
                          <span className={styles.actorDetailValue}>{selectedActor.birthday}</span>
                        </div>
                      )}
                      <div className={styles.actorDetailItem}>
                        <span className={styles.actorDetailLabel}>Country</span>
                        <span className={styles.actorDetailValue}>{selectedActor.country}</span>
                      </div>
                      <div className={styles.actorDetailItem}>
                        <span className={styles.actorDetailLabel}>Gender</span>
                        <span className={styles.actorDetailValue}>{selectedActor.gender}</span>
                      </div>
                      <div className={styles.actorDetailItem}>
                        <span className={styles.actorDetailLabel}>Known For</span>
                        <span className={styles.actorDetailValue}>{selectedActor.knownFor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <VideoPlayerModal
          isOpen={isPlayerOpen}
          onClose={() => setIsPlayerOpen(false)}
          movieTitle={movie.title}
        />
      </div>
    </DashboardLayout>
  )
}
