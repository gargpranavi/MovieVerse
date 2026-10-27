// Interactive 1–5 star rating picker with keyboard + mouse support
import { useState } from 'react'
import styles from './StarRatingPicker.module.css'

export default function StarRatingPicker({ rating, onChange, onBlur, error }) {
  // hoverRating tracks which star the cursor is currently over
  const [hoverRating, setHoverRating] = useState(0)

  // Handle keyboard: Enter/Space selects, arrows change value
  const handleKeyDown = (e, starValue) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(starValue)
    } else if (e.key === 'ArrowRight' && starValue < 5) {
      e.preventDefault()
      onChange(starValue + 1)
      // Move focus to next star
      document.getElementById(`star-${starValue + 1}`)?.focus()
    } else if (e.key === 'ArrowLeft' && starValue > 1) {
      e.preventDefault()
      onChange(starValue - 1)
      document.getElementById(`star-${starValue - 1}`)?.focus()
    }
  }

  // Determine fill: use hoverRating while hovering, else actual rating
  const displayRating = hoverRating || rating

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Star Rating</span>
      {/* role="group" groups the star buttons semantically */}
      <div
        className={styles.starsRow}
        role="group"
        aria-label="Star rating picker"
        onMouseLeave={() => setHoverRating(0)}
        onBlur={(e) => {
          // Only trigger onBlur when focus leaves the whole group
          if (!e.currentTarget.contains(e.relatedTarget)) {
            onBlur && onBlur()
          }
        }}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            id={`star-${star}`}
            type="button"
            className={`${styles.star} ${star <= displayRating ? styles.starFilled : styles.starEmpty}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            aria-pressed={rating === star}
          >
            ★
          </button>
        ))}
        {/* Show numeric value after stars */}
        {rating > 0 && (
          <span className={styles.ratingValue}>{rating}/5</span>
        )}
      </div>
      {/* Inline error if no star selected on submit */}
      {error && (
        <span className={styles.errorMsg} role="alert">
          ⚠ {error}
        </span>
      )}
    </div>
  )
}
