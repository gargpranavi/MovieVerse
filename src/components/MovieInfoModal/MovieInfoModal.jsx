import { useEffect } from 'react'
import styles from './MovieInfoModal.module.css'

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5"
         strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function MovieInfoModal({ isOpen, onClose, movie, onPlay }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen || !movie) return null

  const rating = movie.rating ? Number(movie.rating).toFixed(1) : null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label={`More info about ${movie.title}`}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.banner} style={{ backgroundImage: `url(${movie.image})` }}>
          <div className={styles.bannerGradient} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close info panel">
            <CloseIcon />
          </button>
          <div className={styles.bannerContent}>
            <div className={styles.label}>
              <span className={styles.labelLetter}>M</span>
              <span className={styles.labelText}>M O V I E V E R S E   O R I G I N A L</span>
            </div>
            <h2 className={styles.title}>{movie.title.toUpperCase()}</h2>
            <div className={styles.heroBtns}>
              <button className={styles.playBtn} onClick={() => { onClose(); onPlay && onPlay() }}>
                <PlayIcon /> Play
              </button>
              <button className={styles.addBtn} aria-label="Add to My List">
                <PlusIcon /> My List
              </button>
            </div>
          </div>
        </div>
        <div className={styles.body}>
          <div className={styles.metaCol}>
            {rating && (
              <div className={styles.ratingRow}>
                <span className={styles.ratingBadge}><StarIcon /> {rating}</span>
                <span className={styles.ratingLabel}>/ 10 Rating</span>
              </div>
            )}
            <div className={styles.metaGrid}>
              {movie.year && (
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Year</span>
                  <span className={styles.metaVal}>{movie.year}</span>
                </div>
              )}
              {movie.duration && (
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Runtime</span>
                  <span className={styles.metaVal}>{movie.duration}</span>
                </div>
              )}
              {movie.ageRating && (
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Rated</span>
                  <span className={styles.metaVal}><span className={styles.ageBadge}>{movie.ageRating}</span></span>
                </div>
              )}
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className={styles.genresSection}>
                <span className={styles.genresLabel}>Genres</span>
                <div className={styles.genres}>
                  {movie.genres.map((g) => (
                    <span key={g} className={styles.genreTag}>{g}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.descCol}>
            <h3 className={styles.descHeading}>About this title</h3>
            <p className={styles.desc}>{movie.description || 'No description available.'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
