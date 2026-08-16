/* =============================================
   Filmoria – EmptyState.jsx
   Member 2 | Empty Watchlist State Component
   Day 2 – Watchlist + localStorage
   ============================================= */

import styles from './EmptyState.module.css'

/* ── Film reel SVG ──────────────────────────── */
function FilmReelIcon() {
  return (
    <svg
      width="72"
      height="72"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2"  y1="7"  x2="7"  y2="7" />
      <line x1="2"  y1="17" x2="7"  y2="17" />
      <line x1="17" y1="17" x2="22" y2="17" />
      <line x1="17" y1="7"  x2="22" y2="7" />
    </svg>
  )
}

/* ── EmptyState Component ────────────────────── */
export default function EmptyState() {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.iconRing}>
        <FilmReelIcon />
      </div>

      <h2 className={styles.heading}>🎬 Your watchlist is empty</h2>

      <p className={styles.sub}>
        Shows and movies you save will appear here.<br />
        Browse and hit <strong>+ Add</strong> on anything you want to watch!
      </p>

      <a href="/shows" className={styles.cta} id="emptyStateExploreCta">
        Browse Shows
      </a>
    </div>
  )
}
