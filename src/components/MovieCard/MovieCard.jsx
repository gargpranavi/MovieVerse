import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import { isLiked, toggleLike } from '../../utils/likes.js'
import styles from './MovieCard.module.css'

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  )
}

export default function MovieCard({ movie, rank }) {
  const navigate = useNavigate()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeAnimate, setLikeAnimate] = useState(false)

  useEffect(() => {
    setInWatchlist(isInWatchlist(movie.id))
    setLiked(isLiked(movie.id))

    const handleWatchlistUpdate = () => setInWatchlist(isInWatchlist(movie.id))
    const handleLikesUpdate = () => setLiked(isLiked(movie.id))

    window.addEventListener('watchlistUpdated', handleWatchlistUpdate)
    window.addEventListener('likesUpdated', handleLikesUpdate)
    return () => {
      window.removeEventListener('watchlistUpdated', handleWatchlistUpdate)
      window.removeEventListener('likesUpdated', handleLikesUpdate)
    }
  }, [movie.id])

  // Use dummy image if movie.image is not provided in mock data
  const imageUrl = movie.image || `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80&auto=format&fit=crop`
  
  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`)
  }

  const handleWatchlistToggle = (e) => {
    e.stopPropagation()
    toggleWatchlist(movie)
  }

  const handleLikeToggle = (e) => {
    e.stopPropagation()
    toggleLike(movie)
    // trigger pop animation
    setLikeAnimate(true)
    setTimeout(() => setLikeAnimate(false), 400)
  }

  return (
    <div className={styles.cardContainer} onClick={handleCardClick}>
      <div className={styles.cardImageWrapper}>
        {rank && <span className={styles.rank}>{rank}</span>}
        <img src={imageUrl} alt={movie.title} className={styles.cardImage} />
        
        {/* Slide & Glow Overlay */}
        <div className={styles.cardOverlay}>
          <h3 className={styles.cardTitle}>{movie.title}</h3>
          
          <div className={styles.metaInfo}>
            <span className={styles.match}>98% Match</span>
            <span className={styles.ageBadge}>{movie.ageRating || 'U/A 16+'}</span>
            <span>{movie.duration || '2h 14m'}</span>
          </div>
          
          <div className={styles.genres}>
            {(movie.genres || ['Action', 'Thriller', 'Sci-Fi']).map((genre, i) => (
              <span key={i}>
                {genre}
                {i < (movie.genres || ['Action', 'Thriller', 'Sci-Fi']).length - 1 && <span className={styles.dot}>•</span>}
              </span>
            ))}
          </div>

          <div className={styles.controls}>
            <button className={styles.playBtn} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}><PlayIcon /></button>
            <button 
              className={styles.circleBtn} 
              onClick={handleWatchlistToggle}
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              aria-label={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
            >
              {inWatchlist ? <CheckIcon /> : <PlusIcon />}
            </button>
            <button
              className={`${styles.circleBtn} ${liked ? styles.circleBtnLiked : ''} ${likeAnimate ? styles.likeAnimate : ''}`}
              onClick={handleLikeToggle}
              title={liked ? 'Unlike' : 'Like'}
              aria-label={liked ? 'Unlike this movie' : 'Like this movie'}
            >
              <HeartIcon filled={liked} />
            </button>
            <button className={styles.circleBtn} style={{ marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}><ChevronDownIcon /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
