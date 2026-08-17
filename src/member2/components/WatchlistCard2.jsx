/* =============================================
   Filmoria – WatchlistCard2.jsx
   Member 2 | Amazon Prime-style card
   Used on: /watchlist (all buttons)
            /watched   (no "mark watched" btn, shows watched date)
   ============================================= */

import styles from './WatchlistCard2.module.css'

/* ── Helpers ─────────────────────────────────── */
function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '').trim() : ''
}

/* ── Icons ───────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

/* ══════════════════════════════════════════════
   WatchlistCard2
   Props:
     show            — TVMaze show object (may include .watchedDate)
     onRemove(id)    — called when remove button clicked
     onMarkWatched   — optional; if omitted, "Mark Watched" btn is hidden
     removeLabel     — optional; custom tooltip for remove button
   ══════════════════════════════════════════════ */
export default function WatchlistCard2({
  show,
  onRemove,
  onMarkWatched,
  removeLabel = 'Remove from Watchlist',
}) {
  const id          = show?.id
  const title       = show?.name              ?? 'Unknown'
  const rating      = show?.rating?.average   ?? null
  const poster      = show?.image?.original   ?? show?.image?.medium ?? null
  const genres      = show?.genres            ?? []
  const summary     = stripHtml(show?.summary ?? '').slice(0, 130)
  const status      = show?.status            ?? ''
  const watchedDate = show?.watchedDate       ?? null   // set on /watched page

  return (
    <article className={styles.card} id={`watchlist-card-${id}`}>

      {/* ── Thumbnail ─────────────────────────── */}
      <div className={styles.thumb}>

        {/* Poster */}
        {poster
          ? <img src={poster} alt={title} className={styles.img} loading="lazy"
              onError={e => {
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextSibling.style.display = 'flex'
              }}
            />
          : null
        }
        <div className={styles.fallback} style={{ display: poster ? 'none' : 'flex' }}>
          <span className={styles.fallbackLetter}>{title.charAt(0)}</span>
        </div>

        {/* Status ribbon */}
        {status === 'Running' && (
          <div className={styles.ribbon}>● Now Airing</div>
        )}

        {/* Watched ribbon (only on /watched page) */}
        {watchedDate && (
          <div className={`${styles.ribbon} ${styles.ribbonWatched}`}>
            <EyeIcon /> Watched
          </div>
        )}

        {/* Rating badge (shows on hover) */}
        {rating && (
          <div className={styles.ratingBadge}>★ {rating}</div>
        )}
      </div>

      {/* ══ Info panel — drops below on hover ═══ */}
      <div className={styles.infoPanel}>

        {/* Watched date strip (only on /watched page) */}
        {watchedDate && (
          <div className={styles.watchedDateStrip}>
            <EyeIcon /> Watched on {watchedDate}
          </div>
        )}

        {/* Action buttons */}
        <div className={styles.actionRow}>
          <div className={styles.actionLeft}>

            {/* Play */}
            <button
              className={styles.btnPlay}
              onClick={() => window.open(`https://www.tvmaze.com/shows/${id}`, '_blank')}
              aria-label={`Watch ${title}`}
              title="Watch on TVMaze"
            >
              <div className={styles.playTriangle} />
            </button>

            {/* Mark watched — only on /watchlist page */}
            {onMarkWatched && (
              <button
                className={`${styles.iconBtn} ${styles.btnWatched}`}
                id={`markWatched-${id}`}
                onClick={() => onMarkWatched(show)}
                aria-label={`Mark ${title} as watched`}
                title="Mark as Watched"
              >
                <CheckIcon />
              </button>
            )}

            {/* Remove */}
            <button
              className={`${styles.iconBtn} ${styles.btnRemove}`}
              id={`remove-${id}`}
              onClick={() => onRemove(id)}
              aria-label={`Remove ${title}`}
              title={removeLabel}
            >
              <RemoveIcon />
            </button>
          </div>

          {/* More info */}
          <button
            className={styles.iconBtn}
            aria-label="More info"
            title="More info"
          >
            <InfoIcon />
          </button>
        </div>

        {/* Title */}
        <h3 className={styles.title}>{title}</h3>

        {/* Meta */}
        <div className={styles.meta}>
          {rating && <span className={styles.metaRating}>★ {rating}</span>}
          {rating && status && <span className={styles.metaDot}>•</span>}
          {status && (
            <span className={`${styles.metaStatus} ${status === 'Running' ? styles.running : styles.ended}`}>
              {status}
            </span>
          )}
          {genres.slice(0, 2).map((g, i) => (
            <span key={g} className={styles.metaGenre}>
              {i > 0 && <span className={styles.metaDot}> • </span>}{g}
            </span>
          ))}
        </div>

        {/* Summary */}
        {summary && <p className={styles.summary}>{summary}{summary.length >= 130 ? '…' : ''}</p>}
      </div>

    </article>
  )
}
