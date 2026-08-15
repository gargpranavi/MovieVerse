/* =============================================
   Filmoria – WatchlistCard2.jsx
   Member 2 | Reusable Watchlist Card Component
   Using real API data from feecq.github.io
   ============================================= */

import styles from './WatchlistCard2.module.css'

/* ── Star Icon ───────────────────────────────── */
function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )
}

/* ── Trash Icon ──────────────────────────────── */
function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}

/* ── Check Icon ──────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

/* ── External Link Icon ──────────────────────── */
function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

/* ── WatchlistCard Component ─────────────────── */
export default function WatchlistCard2({ movie, onRemove, onMarkWatched }) {
  const { id, movie: title, rating, image, imdb_url } = movie

  return (
    <article className={styles.card} id={`watchlist-card-${id}`}>

      {/* Poster — real image from API */}
      <div className={styles.posterWrapper}>
        <img
          src={image}
          alt={`${title} movie poster`}
          className={styles.posterImg}
          loading="lazy"
          onError={e => {
            // Fallback to gradient if image fails to load
            e.currentTarget.style.display = 'none'
            e.currentTarget.nextSibling.style.display = 'flex'
          }}
        />
        {/* Fallback gradient */}
        <div className={styles.posterFallback} style={{ display: 'none' }}>
          <span className={styles.fallbackText}>{title?.charAt(0)}</span>
        </div>

        {/* Overlay */}
        <div className={styles.posterOverlay} />

        {/* Rating badge */}
        <div className={styles.ratingBadge}>
          <StarIcon />
          <span>{rating}</span>
        </div>

        {/* IMDb link */}
        {imdb_url && (
          <a
            href={imdb_url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.imdbBadge}
            aria-label={`View ${title} on IMDb`}
            onClick={e => e.stopPropagation()}
          >
            IMDb <ExternalIcon />
          </a>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title} title={title}>{title}</h3>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button
            className={styles.btnWatched}
            id={`markWatched-${id}`}
            onClick={() => onMarkWatched(id)}
            aria-label={`Mark ${title} as watched`}
            title="Mark as Watched"
          >
            <CheckIcon />
            <span>Watched</span>
          </button>

          <button
            className={styles.btnRemove}
            id={`remove-${id}`}
            onClick={() => onRemove(id)}
            aria-label={`Remove ${title} from watchlist`}
            title="Remove from Watchlist"
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </article>
  )
}
