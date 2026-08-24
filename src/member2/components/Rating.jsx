/*
MovieVerse – Rating.jsx
Member 2 | Day 4 — Star Rating Component

localStorage key: "movieverse_ratings"
Entry shape: { movieId: string, rating: number }

Props:
  movieId   — string ID of the show
  size      — 'sm' | 'md' | 'lg'  (default 'md')
  readonly  — if true, stars are display-only (no click)
*/

import { useState, useEffect } from 'react'
import styles from './Rating.module.css'

/*localStorage helpers*/
const LS_KEY = 'movieverse_ratings'

function loadAllRatings() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]')
  } catch {
    return []
  }
}

function saveAllRatings(list) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
    window.dispatchEvent(new Event('ratingsUpdated'))
  } catch { /* ignore */ }
}

/** Get a single movie's rating (number | null) */
export function getMovieRating(movieId) {
  const all = loadAllRatings()
  return all.find(r => r.movieId === String(movieId))?.rating ?? null
}

/** Save / update a single movie's rating */
export function saveMovieRating(movieId, rating) {
  const all = loadAllRatings()
  const idx = all.findIndex(r => r.movieId === String(movieId))
  if (idx > -1) {
    all[idx].rating = rating
  } else {
    all.push({ movieId: String(movieId), rating })
  }
  saveAllRatings(all)
}

/** Remove a movie's rating */
export function removeMovieRating(movieId) {
  const all = loadAllRatings().filter(r => r.movieId !== String(movieId))
  saveAllRatings(all)
}

/*Star icon*/
function Star({ filled, half }) {
  if (filled) {
    return (
      <svg viewBox="0 0 24 24" fill="#D4A017" stroke="#D4A017" strokeWidth="0.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="rgba(212,160,23,0.4)" strokeWidth="1.5">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/*Rating Component*/
export default function Rating({ movieId, size = 'md', readonly = false }) {
  const [saved,   setSaved]   = useState(null)   // persisted rating
  const [hovered, setHovered] = useState(null)   // hovered star index (1-5)

  /* Load saved rating */
  useEffect(() => {
    setSaved(getMovieRating(movieId))

    const handleUpdate = () => setSaved(getMovieRating(movieId))
    window.addEventListener('ratingsUpdated', handleUpdate)
    return () => window.removeEventListener('ratingsUpdated', handleUpdate)
  }, [movieId])

  const displayRating = hovered ?? saved ?? 0

  function handleClick(e, star) {
    if (readonly) return
    e.stopPropagation()
    if (saved === star) {
      // clicking the same star clears the rating
      removeMovieRating(movieId)
      setSaved(null)
    } else {
      saveMovieRating(movieId, star)
      setSaved(star)
    }
  }

  return (
    <div
      className={`${styles.starRow} ${styles[size]} ${readonly ? styles.readonly : ''}`}
      aria-label={`Rating: ${saved ?? 0} out of 5`}
      role={readonly ? 'img' : 'radiogroup'}
    >
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          className={styles.starBtn}
          onClick={(e) => handleClick(e, star)}
          onMouseEnter={(e) => { if (!readonly) { e.stopPropagation(); setHovered(star) } }}
          onMouseLeave={(e) => { if (!readonly) { e.stopPropagation(); setHovered(null) } }}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          title={`Rate ${star} star${star > 1 ? 's' : ''}`}
          disabled={readonly}
        >
          <Star filled={star <= displayRating} />
        </button>
      ))}
      {saved && !readonly && (
        <span className={styles.ratingLabel}>{saved}/5</span>
      )}
    </div>
  )
}
