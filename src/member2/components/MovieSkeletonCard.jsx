/*
   MovieVerse – MovieSkeletonCard.jsx
   Member 2 | Day 3 — Reusable skeleton placeholder for movie cards.

   Matches the 2:3 poster aspect-ratio and inner layout of <MovieCard>:
     - Poster area with shimmer animation
     - Two shimmer lines at the bottom mimicking title + meta

   Props:
     count  {number}  – convenience: render `count` cards inside a fragment
                        (default 1, used when embedding a batch inline)
*/

import styles from './MovieSkeletonCard.module.css'

/**
 * Single skeleton card — one placeholder matching <MovieCard> dimensions.
 */
export default function MovieSkeletonCard() {
  return (
    <div className={styles.card} aria-hidden="true">
      {/* Poster shimmer */}
      <div className={styles.poster} />

      {/* Overlay shimmer lines (title + meta) */}
      <div className={styles.overlay}>
        <div className={styles.lineTitle} />
        <div className={styles.lineMeta} />
      </div>
    </div>
  )
}

/**
 * Renders `count` skeleton cards inside a React fragment.
 * Useful for inline "loading more" rows.
 *
 * @param {{ count?: number }} props
 */
export function MovieSkeletonRow({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <MovieSkeletonCard key={i} />
      ))}
    </>
  )
}
