import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import styles from './MovieDetailsPage.module.css'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"></line>
      <polyline points="12 19 5 12 12 5"></polyline>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--gold-mid)' }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

export default function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inWatchlist, setInWatchlist] = useState(false)

  useEffect(() => {
    fetch(`https://api.tvmaze.com/shows/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Movie not found')
        return res.json()
      })
      .then(show => {
        const mappedMovie = {
          id: show.id.toString(),
          title: show.name,
          year: show.premiered ? show.premiered.substring(0, 4) : '2023',
          duration: `${show.runtime || show.averageRuntime || 120} mins`,
          ageRating: 'U/A 16+',
          genres: show.genres.length > 0 ? show.genres : ['Drama'],
          description: show.summary ? show.summary.replace(/<[^>]*>?/gm, '') : 'No summary available.',
          image: show.image ? show.image.original : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80',
          rating: show.rating?.average || 8.0,
          language: show.language,
          network: show.network ? show.network.name : show.webChannel ? show.webChannel.name : 'Unknown Network',
          status: show.status,
        }
        setMovie(mappedMovie)
        setInWatchlist(isInWatchlist(mappedMovie.id))
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!movie) return
    
    const handleUpdate = () => {
      setInWatchlist(isInWatchlist(movie.id))
    }

    window.addEventListener('watchlistUpdated', handleUpdate)
    return () => window.removeEventListener('watchlistUpdated', handleUpdate)
  }, [movie])

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'white' }}>
          <h2>Loading details...</h2>
        </div>
      </DashboardLayout>
    )
  }

  if (!movie) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '80vh', color: 'white', gap: '20px' }}>
          <h2>Movie not found!</h2>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeftIcon /> Go Back</button>
        </div>
      </DashboardLayout>
    )
  }

  const handleWatchlistToggle = () => {
    toggleWatchlist(movie)
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Back to Browse
        </button>

        <div className={styles.contentWrapper}>
          {/* Vertical Poster Section */}
          <div className={styles.posterSection}>
            <div className={styles.glowCard}>
              <img src={movie.image} alt={movie.title} className={styles.posterImage} />
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.detailsSection}>
            <h1 className={styles.title}>{movie.title.toUpperCase()}</h1>
            
            <div className={styles.metaRow}>
              <span className={styles.ratingBadge}>
                <StarIcon /> {movie.rating} / 10
              </span>
              <span>{movie.year}</span>
              <span>{movie.duration}</span>
              <span className={styles.ageBadge}>{movie.ageRating}</span>
            </div>

            <div className={styles.genresRow}>
              {movie.genres.map((genre, index) => (
                <span key={index} className={styles.genreTag}>{genre}</span>
              ))}
            </div>

            <p className={styles.description}>{movie.description}</p>

            <div className={styles.infoGrid}>
              <div>
                <span className={styles.infoLabel}>Language:</span>
                <span className={styles.infoValue}>{movie.language || 'English'}</span>
              </div>
              <div>
                <span className={styles.infoLabel}>Network:</span>
                <span className={styles.infoValue}>{movie.network}</span>
              </div>
              <div>
                <span className={styles.infoLabel}>Status:</span>
                <span className={styles.infoValue}>{movie.status}</span>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button className={styles.btnPlay}>
                <PlayIcon /> Play Now
              </button>
              <button 
                className={styles.btnWatchlist}
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <CheckIcon /> : <PlusIcon />}
                {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

