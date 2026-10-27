/*
  CommunityReviewsList.jsx — Member 3
  Displays saved community reviews for a movie.
  Reviews are loaded from localStorage (communityReviews utility).
  Each review shows: name, star rating, date, and review text.
*/
import styles from './CommunityReviewsList.module.css'

// Renders filled/empty stars for a given rating value
function StarDisplay({ rating }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= rating ? styles.starFilled : styles.starEmpty}
        >
          ★
        </span>
      ))}
    </span>
  )
}

export default function CommunityReviewsList({ reviews }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>💬</span>
        <p>No community reviews yet. Be the first to leave one!</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      <p className={styles.count}>{reviews.length} community review{reviews.length !== 1 ? 's' : ''}</p>
      {reviews.map((review) => (
        <article key={review.id} className={styles.card}>
          {/* Reviewer name + date header */}
          <div className={styles.header}>
            <div className={styles.avatar} aria-hidden="true">
              {review.name.charAt(0).toUpperCase()}
            </div>
            <div className={styles.meta}>
              <span className={styles.name}>{review.name}</span>
              <span className={styles.date}>{review.date}</span>
            </div>
            <StarDisplay rating={review.rating} />
          </div>
          {/* Review body text */}
          <p className={styles.text}>&ldquo;{review.text}&rdquo;</p>
        </article>
      ))}
    </div>
  )
}
