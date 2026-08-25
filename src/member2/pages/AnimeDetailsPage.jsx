/*
   MovieVerse – AnimeDetailsPage.jsx
   Member 2 | Anime Detail View  /anime/:id

   Works entirely on local animeData.js —
   same pattern as MovieDetailsPage.jsx uses shows.js.
   No API calls. No loading states. Instant render.
*/

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import AnimeCarousel from '../components/AnimeCarousel.jsx'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import { isWatched, addToWatched, removeFromWatched, getWatchedDate } from '../../utils/watched.js'
import { getUserRating, saveUserRating, getUserReview, saveUserReview } from '../../utils/reviews.js'
import { isLiked, toggleLike } from '../../utils/likes.js'
import { fallbackAnime, findFallbackById } from '../data/animeData.js'
import styles from './AnimeDetailsPage.module.css'

/*Icons*/
function PlayIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z"/></svg>
}
function PlusIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function CheckIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
}
function ArrowLeftIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
function EyeIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
}
function HeartIcon({ filled }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : 'currentColor'} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
}
function StarIcon({ filled }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? '#D4A017' : 'none'} stroke={filled ? '#D4A017' : '#555'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
}

const FALLBACK_POSTER = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80'

/*AnimeDetailsPage*/
export default function AnimeDetailsPage() {
  const { id }   = useParams()
  const navigate = useNavigate()

  //Local data lookup (no fetch - mirrors MovieDetailsPage)
  const anime = findFallbackById(id) || null

  // Related: same-genre anime, excluding current (mirrors MovieDetailsPage logic)
  const related = fallbackAnime
    .filter(a => a.id !== id && a.genres?.some(g => anime?.genres?.includes(g)))
    .slice(0, 8)

  // User interaction state
  const [inWatchlist,  setInWatchlist]  = useState(false)
  const [watchedState, setWatchedState] = useState(false)
  const [watchedDate,  setWatchedDate]  = useState(null)
  const [liked,        setLiked]        = useState(false)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  // Rating & Review
  const [userRating,       setUserRating]      = useState(0)
  const [reviewText,       setReviewText]       = useState('')
  const [savedReview,      setSavedReview]      = useState(null)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  const [hoverStar,        setHoverStar]        = useState(0)

  // Initialise from localStorage when anime id changes (same as MovieDetailsPage)
  useEffect(() => {
    if (!anime) return
    setInWatchlist(isInWatchlist(anime.id))
    setWatchedState(isWatched(anime.id))
    setWatchedDate(getWatchedDate(anime.id))
    setLiked(isLiked(anime.id))
    setUserRating(getUserRating(anime.id) || 0)

    const review = getUserReview(anime.id)
    if (review) { setSavedReview(review); setReviewText(review.reviewText || '') }
    else { setSavedReview(null); setReviewText('') }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Real-time watchlist sync
  useEffect(() => {
    if (!anime) return
    const handle = () => setInWatchlist(isInWatchlist(anime.id))
    window.addEventListener('watchlistUpdated', handle)
    return () => window.removeEventListener('watchlistUpdated', handle)
  }, [anime])

  // Handlers
  const handleWatchlistToggle = () => { if (anime) toggleWatchlist(anime) }

  const handleWatchedToggle = () => {
    if (!anime) return
    if (watchedState) {
      removeFromWatched(anime.id)
      setWatchedState(false)
      setWatchedDate(null)
    } else {
      const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      addToWatched(anime, dateStr)
      setWatchedState(true)
      setWatchedDate(dateStr)
    }
  }

  const handleLikeToggle = () => {
    if (anime) toggleLike(anime)
    setLiked(l => !l)
  }

  const handleStarClick = (star) => {
    if (!anime) return
    const next = userRating === star ? 0 : star
    setUserRating(next)
    saveUserRating(anime.id, next)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!anime || !reviewText.trim()) return
    saveUserReview(anime.id, reviewText, anime.title)
    setSavedReview({
      reviewText,
      reviewDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      movieTitle: anime.title,
    })
    setIsReviewFormOpen(false)
  }

  //Not found (mirrors MovieDetailsPage) */
  if (!anime) {
    return (
      <DashboardLayout>
        <div className={styles.notFoundWrap}>
          <div className={styles.notFoundIcon}>📺</div>
          <h2>Anime Not Found</h2>
          <p>We couldn't find this anime in our collection.</p>
          <button className={styles.backBtn} onClick={() => navigate('/anime')}>
            <ArrowLeftIcon /> Back to Anime
          </button>
        </div>
      </DashboardLayout>
    )
  }

  //Derived values
  const posterImage = anime.image || FALLBACK_POSTER
  const bannerImage = anime.banner || posterImage

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/*HERO BANNER*/}
        <div className={styles.hero}>
          <div className={styles.heroBg} style={{ backgroundImage: `url(${bannerImage})` }} />
          <div className={styles.heroGradient} />

          <div className={styles.heroInner}>
            {/* Back button */}
            <button className={styles.backBtn} onClick={() => navigate('/anime')}>
              <ArrowLeftIcon /> Anime
            </button>

            <div className={styles.heroLayout}>

              {/*Poster*/}
              <div className={styles.posterWrap}>
                <img
                  src={posterImage}
                  alt={anime.title}
                  className={styles.poster}
                  onError={e => { e.currentTarget.src = FALLBACK_POSTER }}
                />
              </div>

              {/* Info panel*/}
              <div className={styles.infoPanel}>
                {anime.type && (
                  <span className={styles.typeBadge}>{anime.type}</span>
                )}

                <h1 className={styles.title}>{anime.title}</h1>

                {anime.titleJP && anime.titleJP !== anime.title && (
                  <p className={styles.titleJP}>{anime.titleJP}</p>
                )}

                {/* Meta pills */}
                <div className={styles.metaRow}>
                  {anime.year && anime.year !== 'N/A' && (
                    <span className={styles.metaPill}>{anime.year}</span>
                  )}
                  {anime.episodes && (
                    <span className={styles.metaPill}>{anime.episodes} Episodes</span>
                  )}
                  {anime.duration && (
                    <span className={styles.metaPill}>{anime.duration}</span>
                  )}
                  {anime.status && (
                    <span className={`${styles.metaPill} ${anime.status === 'Currently Airing' ? styles.airingPill : ''}`}>
                      {anime.status}
                    </span>
                  )}
                  {anime.ageRating && (
                    <span className={styles.metaPill}>{anime.ageRating}</span>
                  )}
                </div>

                {/* MAL Score */}
                {anime.rating && (
                  <div className={styles.scoreRow}>
                    <span className={styles.scoreStar}>★</span>
                    <span className={styles.scoreNum}>{Number(anime.rating).toFixed(2)}</span>
                    <span className={styles.scoreSub}>MAL Score</span>
                  </div>
                )}

                {/* Genres */}
                {anime.genres?.length > 0 && (
                  <div className={styles.genreRow}>
                    {anime.genres.map((g, i) => (
                      <span key={i} className={styles.genreTag}>{g}</span>
                    ))}
                  </div>
                )}

                {/* Studio */}
                {anime.studios?.length > 0 && (
                  <p className={styles.studioLine}>
                    Studio: <strong>{anime.studios.join(', ')}</strong>
                  </p>
                )}

                {/* Source material */}
                {anime.source && (
                  <p className={styles.studioLine}>
                    Source: <strong>{anime.source}</strong>
                  </p>
                )}

                {/* Description */}
                <p className={styles.description}>{anime.description}</p>

                {/* Action buttons */}
                <div className={styles.actionRow}>
                  <button className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
                    <PlayIcon /> Play
                  </button>

                  <button className={styles.btnWatchlist} onClick={handleWatchlistToggle}>
                    {inWatchlist ? <CheckIcon /> : <PlusIcon />}
                    {inWatchlist ? 'In Watchlist' : 'Watchlist'}
                  </button>

                  <button
                    className={`${styles.btnWatched} ${watchedState ? styles.btnWatchedActive : ''}`}
                    onClick={handleWatchedToggle}
                    title={watchedDate ? `Watched on ${watchedDate}` : 'Mark as watched'}
                  >
                    <EyeIcon />
                    {watchedState ? 'Watched' : 'Mark Watched'}
                  </button>

                  <button
                    className={`${styles.btnLike} ${liked ? styles.btnLikeActive : ''}`}
                    onClick={handleLikeToggle}
                    title={liked ? 'Unlike' : 'Like'}
                  >
                    <HeartIcon filled={liked} />
                  </button>
                </div>

                {watchedDate && (
                  <p className={styles.watchedDateLine}>✓ Watched on {watchedDate}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RATING & REVIEW SECTION
            (same as MovieDetailsPage)
        */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Your Rating</h2>
          <div className={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                className={styles.starBtn}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverStar(star)}
                onMouseLeave={() => setHoverStar(0)}
                aria-label={`Rate ${star} stars`}
              >
                <StarIcon filled={star <= (hoverStar || userRating)} />
              </button>
            ))}
            {userRating > 0 && (
              <span className={styles.starLabel}>{userRating} / 5</span>
            )}
          </div>

          {/* Review display / form */}
          {savedReview && !isReviewFormOpen ? (
            <div className={styles.savedReview}>
              <p className={styles.savedReviewText}>"{savedReview.reviewText}"</p>
              <div className={styles.savedReviewMeta}>
                <span>Reviewed on {savedReview.reviewDate}</span>
                <button className={styles.editReviewBtn} onClick={() => setIsReviewFormOpen(true)}>
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <form className={styles.reviewForm} onSubmit={handleReviewSubmit}>
              <textarea
                className={styles.reviewTextarea}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Write your thoughts about this anime..."
                rows={4}
              />
              <div className={styles.reviewFormActions}>
                <button type="submit" className={styles.btnSubmitReview} disabled={!reviewText.trim()}>
                  Save Review
                </button>
                {savedReview && (
                  <button type="button" className={styles.btnCancelReview} onClick={() => setIsReviewFormOpen(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        {/*
            RELATED ANIME
            (genre-matched, like MovieDetailsPage)
        */}
        {related.length > 0 && (
          <div className={styles.relatedSection}>
            <AnimeCarousel title="More Like This" movies={related} />
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        movieTitle={anime.title}
      />
    </DashboardLayout>
  )
}
