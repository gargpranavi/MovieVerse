/* =============================================
   MovieVerse – AnimeCard.jsx
   Member 2 | Anime portrait card

   Visually IDENTICAL to MovieCard.jsx.
   Only difference: navigates to /anime/:id
   instead of /movie/:id.

   Accepts same `movie` prop shape as MovieCard,
   plus an optional `rank` prop.
   ============================================= */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import { isLiked, toggleLike } from '../../utils/likes.js'
import styles from './AnimeCard.module.css'

/* ── Icons (identical to MovieCard) ─────────── */
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function HeartIcon({ filled }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24"
         fill={filled ? '#ef4444' : 'none'}
         stroke={filled ? '#ef4444' : 'currentColor'}
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

/* ════════════════════════════════════════════════
   AnimeCard
   ════════════════════════════════════════════════ */
export default function AnimeCard({ movie, rank }) {
  const navigate = useNavigate()

  // Use movie.id for storage — this is the normalised ID (e.g. 'fb-5114' or '5114')
  const itemId = movie?.id

  const [inWatchlist,  setInWatchlist]  = useState(false)
  const [liked,        setLiked]        = useState(false)
  const [likeAnimate,  setLikeAnimate]  = useState(false)

  useEffect(() => {
    if (!itemId) return
    setInWatchlist(isInWatchlist(itemId))
    setLiked(isLiked(itemId))

    const handleWatchlistUpdate = () => setInWatchlist(isInWatchlist(itemId))
    const handleLikesUpdate     = () => setLiked(isLiked(itemId))

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate)
    window.addEventListener('likesUpdated',     handleLikesUpdate)
    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate)
      window.removeEventListener('likesUpdated',     handleLikesUpdate)
    }
  }, [itemId])

  // Unique per-anime fallback — pick from 6 distinct anime-themed images
  // based on the title so the same card always gets the same fallback
  const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80',
    'https://images.unsplash.com/photo-1614583224978-f05ce51ef5fa?w=600&q=80',
    'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=600&q=80',
    'https://images.unsplash.com/photo-1535223289429-462dc7ca4d80?w=600&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80',
  ]
  const fallbackIdx = movie?.title
    ? movie.title.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % FALLBACK_IMAGES.length
    : 0
  const FALLBACK_IMAGE = FALLBACK_IMAGES[fallbackIdx]

  const imageUrl = movie?.image || FALLBACK_IMAGE

  const handleCardClick = () => {
    // Navigate to anime detail route, not /movie/:id
    navigate(`/anime/${itemId}`)
  }

  const handleWatchlistToggle = (e) => {
    e.stopPropagation()
    toggleWatchlist(movie)
  }

  const handleLikeToggle = (e) => {
    e.stopPropagation()
    toggleLike(movie)
    setLikeAnimate(true)
    setTimeout(() => setLikeAnimate(false), 400)
  }

  if (!movie) return null

  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      <div className={styles.cardImageWrapper}>
        {rank && <span className={styles.rank}>{rank}</span>}

        <img
          src={imageUrl}
          alt={movie.title}
          className={styles.cardImage}
          onError={e => { e.currentTarget.src = FALLBACK_IMAGE }}
          loading="lazy"
        />

        {/* Hover Overlay */}
        <div className={styles.cardOverlay}>
          <h3 className={styles.cardTitle}>{movie.title}</h3>

          <div className={styles.metaInfo}>
            {movie.rating && (
              <span className={styles.match}>★ {Number(movie.rating).toFixed(1)}</span>
            )}
            {movie.type && (
              <span className={styles.typeBadge}>{movie.type}</span>
            )}
            {movie.episodes && (
              <span>{movie.episodes} eps</span>
            )}
          </div>

          <div className={styles.genres}>
            {(movie.genres || []).slice(0, 3).map((genre, i, arr) => (
              <span key={i}>
                {genre}
                {i < arr.length - 1 && <span className={styles.dot}>•</span>}
              </span>
            ))}
          </div>

          <div className={styles.controls}>
            <button
              className={styles.playBtn}
              onClick={(e) => { e.stopPropagation(); handleCardClick() }}
              aria-label="Play"
            >
              <PlayIcon />
            </button>

            <button
              className={styles.circleBtn}
              onClick={handleWatchlistToggle}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              aria-label={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <CheckIcon /> : <PlusIcon />}
            </button>

            <button
              className={`${styles.circleBtn} ${liked ? styles.circleBtnLiked : ''} ${likeAnimate ? styles.likeAnimate : ''}`}
              onClick={handleLikeToggle}
              title={liked ? 'Unlike' : 'Like'}
              aria-label={liked ? 'Unlike' : 'Like'}
            >
              <HeartIcon filled={liked} />
            </button>

            <button
              className={styles.circleBtn}
              style={{ marginLeft: 'auto' }}
              onClick={(e) => { e.stopPropagation(); handleCardClick() }}
              aria-label="More info"
            >
              <ChevronDownIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
