/*
   MovieVerse – WatchlistCard2.jsx
   Member 2 | Netflix-style portrait card
   (matches MovieCard.jsx design from member 1)

   Day 4 — Rating & Reviews integrated.

   Used on: /watchlist (all buttons)
            /watched   (no "mark watched" btn, shows watched date ribbon)
*/

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isInWatchlist } from '../../utils/watchlist.js'
import Rating from './Rating.jsx'
import ReviewCard from './ReviewCard.jsx'
import styles from './WatchlistCard2.module.css'

/*Icons*/
function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function UndoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </svg>
  )
}

/*
WatchlistCard2
  Props:
    show            — TVMaze show object (may include .watchedDate)
    onRemove(id)    — called when remove button clicked
    onMarkWatched   — optional; if omitted, "Mark Watched" btn is hidden
    removeLabel     — optional; custom tooltip for remove button
*/
export default function WatchlistCard2({
  show,
  onRemove,
  onMarkWatched,
  onMoveBack,
  removeLabel = 'Remove from Watchlist',
}) {
  const navigate = useNavigate()

  const id          = show?.id
  const title       = show?.name || show?.title || 'Unknown'
  const tvRating    = (show?.rating?.average !== undefined) ? show?.rating?.average : (show?.rating ?? null)
  const poster      = show?.image?.original || show?.image?.medium || show?.image || show?.poster || null
  const genres      = show?.genres || show?.genre || []
  const status      = show?.status            ?? ''
  const ageRating   = show?.ageRating         ?? 'U/A 16+'
  const runtime     = show?.runtime           ?? show?.averageRuntime ?? show?.duration ?? null
  const duration    = runtime ? (String(runtime).includes('min') || String(runtime).includes('h') ? runtime : `${runtime} min`) : null
  const watchedDate = show?.watchedDate       ?? null

  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    setInWatchlist(isInWatchlist(id?.toString()))

    const handleUpdate = () => setInWatchlist(isInWatchlist(id?.toString()))
    window.addEventListener('watchlistUpdated', handleUpdate)
    return () => window.removeEventListener('watchlistUpdated', handleUpdate)
  }, [id])

  const imageUrl = poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80'

  const handleCardClick = () => {
    navigate(`/movie/${id}`)
  }

  const handleRemoveClick = (e) => {
    e.stopPropagation()
    onRemove(id)
  }

  const handleMarkWatchedClick = (e) => {
    e.stopPropagation()
    onMarkWatched(show)
  }

  const handleMoveBackClick = (e) => {
    e.stopPropagation()
    onMoveBack(show)
  }

  return (
    <div className={styles.cardContainer} onClick={handleCardClick} id={`watchlist-card-${id}`}>
      <div className={styles.cardImageWrapper}>

        {/* Watched ribbon badge */}
        {watchedDate && (
          <div className={styles.watchedRibbon}>
            <EyeIcon /> Watched
          </div>
        )}

        {/* Status dot - Running */}
        {status === 'Running' && !watchedDate && (
          <div className={styles.liveRibbon}>● Airing</div>
        )}

        <img
          src={imageUrl}
          alt={title}
          className={styles.cardImage}
          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80' }}
        />

        {/* Hover overlay */}
        <div className={styles.cardOverlay}>
          <h3 className={styles.cardTitle}>{title}</h3>

          <div className={styles.metaInfo}>
            {tvRating && <span className={styles.matchText}>★ {tvRating}</span>}
            <span className={styles.ageBadge}>{ageRating}</span>
            {duration && <span>{duration}</span>}
          </div>

          <div className={styles.genres}>
            {genres.slice(0, 3).map((genre, i) => (
              <span key={i}>
                {genre}
                {i < Math.min(genres.length, 3) - 1 && <span className={styles.dot}>•</span>}
              </span>
            ))}
          </div>

          {watchedDate && (
            <div className={styles.watchedDateInOverlay}>
              <EyeIcon /> Watched on {watchedDate}
            </div>
          )}

          {/*Day 4: Star Rating*/}
          <div className={styles.ratingSection} onClick={e => e.stopPropagation()}>
            <span className={styles.ratingLabel}>Rate:</span>
            <Rating movieId={id?.toString()} size="sm" />
          </div>

          {/*Action buttons*/}
          <div className={styles.controls}>
            {/* Play / More Info */}
            <button
              className={styles.playBtn}
              onClick={(e) => { e.stopPropagation(); handleCardClick() }}
              aria-label={`Play ${title}`}
              title="More Info"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <PlayIcon />
            </button>

            {/* Mark as Watched - only on /watchlist */}
            {onMarkWatched && (
              <button
                className={styles.circleBtn}
                onClick={handleMarkWatchedClick}
                aria-label={`Mark ${title} as watched`}
                title="Mark as Watched"
                id={`markWatched-${id}`}
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <CheckIcon />
              </button>
            )}

            {/* Move back to Watchlist - only on /watched */}
            {onMoveBack && (
              <button
                className={styles.circleBtn}
                onClick={handleMoveBackClick}
                aria-label={`Move ${title} back to Watchlist`}
                title="Move back to Watchlist"
                style={{ minHeight: '44px', minWidth: '44px', borderColor: 'rgba(245,200,66,0.5)' }}
              >
                <UndoIcon />
              </button>
            )}

            {/* Remove */}
            <button
              className={`${styles.circleBtn} ${styles.removeBtn}`}
              onClick={handleRemoveClick}
              aria-label={`Remove ${title}`}
              title={removeLabel}
              id={`remove-${id}`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <TrashIcon />
            </button>

            {/* More info chevron */}
            <button
              className={styles.circleBtn}
              style={{ marginLeft: 'auto', minHeight: '44px', minWidth: '44px' }}
              onClick={(e) => { e.stopPropagation(); handleCardClick() }}
              aria-label={`More info about ${title}`}
              title="More Info"
            >
              <ChevronDownIcon />
            </button>
          </div>

          {/*Day 4: Review button + panel*/}
          <div className={styles.reviewSection}>
            <ReviewCard movieId={id?.toString()} movieTitle={title} />
          </div>
        </div>
      </div>
    </div>
  )
}
