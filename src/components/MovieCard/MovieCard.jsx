import { useNavigate } from 'react-router-dom'
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

function ThumbsUpIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
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
  // Use dummy image if movie.image is not provided in mock data
  const imageUrl = movie.image || `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80&auto=format&fit=crop`
  
  const handleCardClick = () => {
    navigate(`/movie/${movie.id}`)
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
            <button className={styles.circleBtn} onClick={(e) => e.stopPropagation()}><PlusIcon /></button>
            <button className={styles.circleBtn} onClick={(e) => e.stopPropagation()}><ThumbsUpIcon /></button>
            <button className={styles.circleBtn} style={{ marginLeft: 'auto' }} onClick={(e) => { e.stopPropagation(); handleCardClick(); }}><ChevronDownIcon /></button>
          </div>
        </div>
      </div>
    </div>
  )
}
