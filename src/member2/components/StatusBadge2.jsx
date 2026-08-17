/* =============================================
   Filmoria – StatusBadge2.jsx
   Member 2 | Reusable Status / Watched Badge
   Day 3 – Watched Movies

   Usage:
     <StatusBadge2 type="watched" />
     <StatusBadge2 type="running" />
     <StatusBadge2 type="ended" />
     <StatusBadge2 type="genre" label="Drama" />
   ============================================= */

import styles from './StatusBadge2.module.css'

/* ── Tiny icons ──────────────────────────────── */
function EyeIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  )
}

/* ══════════════════════════════════════════════
   StatusBadge2 Component
   Props:
     type  — 'watched' | 'running' | 'ended' | 'genre' | 'custom'
     label — override badge text (defaults per type)
     size  — 'sm' (default) | 'md'
   ══════════════════════════════════════════════ */
export default function StatusBadge2({ type = 'custom', label, size = 'sm' }) {
  /* Resolve display text and style variant */
  const config = {
    watched: { text: label ?? 'Watched',     cls: styles.watched,  icon: <EyeIcon /> },
    running: { text: label ?? 'Now Airing',  cls: styles.running,  icon: <DotIcon /> },
    ended:   { text: label ?? 'Ended',       cls: styles.ended,    icon: null },
    genre:   { text: label ?? '',            cls: styles.genre,    icon: null },
    custom:  { text: label ?? '',            cls: styles.custom,   icon: null },
  }

  const { text, cls, icon } = config[type] ?? config.custom

  return (
    <span
      className={`${styles.badge} ${cls} ${size === 'md' ? styles.md : ''}`}
      aria-label={text}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {text}
    </span>
  )
}
