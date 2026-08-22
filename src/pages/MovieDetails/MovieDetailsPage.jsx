import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import { isWatched, addToWatched, removeFromWatched, getWatchedDate } from '../../utils/watched.js'
import { getUserRating, getUserReview, saveUserRating, saveUserReview } from '../../utils/reviews.js'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
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

function StarIcon({ filled, onClick, style }) {
  return (
    <svg 
      width="20" 
      height="20" 
      viewBox="0 0 24 24" 
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ color: filled ? 'var(--gold-mid, #D4A017)' : '#555', cursor: onClick ? 'pointer' : 'default', ...style }}
      onClick={onClick}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  )
}

export default function MovieDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [movie, setMovie] = useState(null)
  const [cast, setCast] = useState([])
  const [crew, setCrew] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  
  const [inWatchlist, setInWatchlist] = useState(false)
  const [watchedState, setWatchedState] = useState(false)
  const [watchedDate, setWatchedDate] = useState(null)
  
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  
  // Rating & Review State
  const [userRating, setUserRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [savedReview, setSavedReview] = useState(null)
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false)
  
  // Actor Modal State
  const [selectedActor, setSelectedActor] = useState(null)
  const [actorDetailsLoading, setActorDetailsLoading] = useState(false)
  const [showAllCast, setShowAllCast] = useState(false)

  // Fetch show details
  useEffect(() => {
    setLoading(true)
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
        setWatchedState(isWatched(mappedMovie.id))
        setWatchedDate(getWatchedDate(mappedMovie.id))
        setUserRating(getUserRating(mappedMovie.id))
        
        const review = getUserReview(mappedMovie.id)
        if (review) {
          setSavedReview(review)
          setReviewText(review.reviewText)
        } else {
          setSavedReview(null)
          setReviewText('')
        }

        // Fetch Recommendations (Same Genre or Similar rating)
        fetch('https://api.tvmaze.com/shows')
          .then(res => res.json())
          .then(allShows => {
            const currentGenres = show.genres;
            const recs = allShows
              .filter(s => s.id.toString() !== show.id.toString())
              .filter(s => s.genres.some(g => currentGenres.includes(g)) || Math.abs((s.rating?.average || 8) - (show.rating?.average || 8)) < 1.5)
              .slice(0, 4)
              .map(s => ({
                id: s.id.toString(),
                title: s.name,
                year: s.premiered ? s.premiered.substring(0, 4) : '2023',
                genres: s.genres,
                image: s.image ? s.image.medium : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
                rating: s.rating?.average || 8.0,
              }))
            setRecommendations(recs)
          })

        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })

    // Fetch Cast & Crew
    fetch(`https://api.tvmaze.com/shows/${id}/cast`)
      .then(res => res.json())
      .then(castData => {
        setCast(castData)
      })
      .catch(err => console.error("Error fetching cast:", err))

    fetch(`https://api.tvmaze.com/shows/${id}/crew`)
      .then(res => res.json())
      .then(crewData => {
        setCrew(crewData.slice(0, 4))
      })
      .catch(err => console.error("Error fetching crew:", err))
  }, [id])

  // Sync Watchlist states
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

  const handleWatchedToggle = () => {
    if (watchedState) {
      removeFromWatched(movie.id)
      setWatchedState(false)
      setWatchedDate(null)
    } else {
      const today = new Date()
      const dateStr = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      addToWatched(movie, dateStr)
      setWatchedState(true)
      setWatchedDate(dateStr)
    }
  }

  const handleRatingClick = (rate) => {
    setUserRating(rate)
    saveUserRating(movie.id, rate)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!reviewText.trim()) return
    saveUserReview(movie.id, reviewText, movie.title)
    setSavedReview({
      reviewText,
      reviewDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    })
    setIsReviewFormOpen(false)
  }

  const handleActorClick = (personId, name) => {
    setActorDetailsLoading(true)
    setSelectedActor({ name, id: personId })
    
    // Fetch actor details
    fetch(`https://api.tvmaze.com/people/${personId}?embed=castcredits`)
      .then(res => res.json())
      .then(person => {
        // Fetch credits or other details
        setSelectedActor({
          id: person.id,
          name: person.name,
          image: person.image ? person.image.original : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
          birthday: person.birthday || 'Unknown',
          country: person.country ? person.country.name : 'Unknown',
          gender: person.gender || 'Unknown',
          knownFor: person._embedded?.castcredits?.length 
            ? `${person._embedded.castcredits.length} credits` 
            : 'Actor'
        })
        setActorDetailsLoading(false)
      })
      .catch(err => {
        console.error(err)
        setActorDetailsLoading(false)
      })
  }

  return (
    <DashboardLayout>
      <div className={styles.container}>
        {/* Back Button */}
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeftIcon /> Back to Browse
        </button>

        <div className={styles.contentWrapper}>
          {/* Poster with play overlay */}
          <div className={styles.posterSection}>
            <div className={styles.glowCard} onClick={() => setIsPlayerOpen(true)}>
              <img src={movie.image} alt={movie.title} className={styles.posterImage} />
              <div className={styles.playOverlay}>
                <div className={styles.playCircle}>
                  <PlayIcon />
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className={styles.detailsSection}>
            <h1 className={styles.title}>{movie.title}</h1>
            
            {/* Inline meta: year • rating • genres */}
            <div className={styles.metaRow}>
              <span>{movie.year}</span>
              <span className={styles.metaDot}>•</span>
              <span className={styles.ratingBadge}>{movie.ageRating}</span>
              {movie.duration && (
                <>
                  <span className={styles.metaDot}>•</span>
                  <span>{movie.duration}</span>
                </>
              )}
              {movie.genres.length > 0 && (
                <>
                  <span className={styles.metaDot}>·</span>
                  {movie.genres.map((genre, i) => (
                    <span key={genre}>
                      <Link to={`/home?genre=${encodeURIComponent(genre)}`} className={styles.genreTagInline}>
                        {genre}
                      </Link>
                      {i < movie.genres.length - 1 && <span style={{color:'rgba(212,160,23,0.4)', margin:'0 2px'}}>,</span>}
                    </span>
                  ))}
                </>
              )}
            </div>

            <p className={styles.description}>{movie.description}</p>

            {/* Info cells with icons */}
            <div className={styles.infoGrid}>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="2" y1="12" x2="22" y2="12"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Language</span>
                  <Link to={`/home?language=${encodeURIComponent(movie.language)}`} className={styles.clickableLink}>
                    {movie.language || 'English'}
                  </Link>
                </div>
              </div>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.05 12H23M1.05 12C1.05 6.477 6.027 2 12 2s10.95 4.477 10.95 10M1.05 12C1.05 17.523 6.027 22 12 22s10.95-4.477 10.95-10"/>
                    <path d="M5 12a15.3 15.3 0 0 0 7 2 15.3 15.3 0 0 0 7-2"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Network</span>
                  <Link to={`/home?network=${encodeURIComponent(movie.network)}`} className={styles.clickableLink}>
                    {movie.network}
                  </Link>
                </div>
              </div>
              <div className={styles.infoCell}>
                <div className={styles.infoCellIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                    <line x1="4" y1="22" x2="4" y2="15"/>
                  </svg>
                </div>
                <div>
                  <span className={styles.infoLabel}>Status</span>
                  <Link to={`/home?status=${encodeURIComponent(movie.status)}`} className={styles.clickableLink}>
                    {movie.status}
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Rating + Review — full width */}
        <div className={styles.ratingsCard}>
          {/* Left: Stars */}
          <div className={styles.ratingHalf}>
            <div className={styles.ratingStarsTitle}>Your Rating</div>
            <div className={styles.starsWrapper}>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon 
                  key={star} 
                  filled={star <= userRating} 
                  onClick={() => handleRatingClick(star)} 
                />
              ))}
              {userRating > 0 && (
                <span className={styles.ratingNumeric} style={{marginLeft: '8px'}}>{userRating}.0/5</span>
              )}
            </div>
            {userRating > 0 && (
              <div className={styles.ratingLabelText}>You rated this {userRating}/5</div>
            )}
          </div>

          {/* Right: Review */}
          <div className={styles.reviewHalf}>
            <div className={styles.reviewHalfHeader}>
              <div className={styles.ratingStarsTitle}>Your Review</div>
              {savedReview && (
                <span className={styles.reviewDate}>{savedReview.reviewDate}</span>
              )}
            </div>
            {savedReview ? (
              <>
                <p className={styles.userReviewText}>"{savedReview.reviewText}"</p>
                <button className={styles.btnWriteReview} onClick={() => setIsReviewFormOpen(true)}>
                  ✏️ Edit Review
                </button>
              </>
            ) : (
              <button className={styles.btnWriteReview} onClick={() => setIsReviewFormOpen(true)}>
                💬 Write a Review
              </button>
            )}
            {isReviewFormOpen && (
              <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                <label className={styles.formTitle}>
                  What did you think about {movie.title}?
                </label>
                <textarea 
                  className={styles.reviewInput} 
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitReviewBtn}>Submit Review</button>
                  <button 
                    type="button" 
                    className={styles.cancelReviewBtn} 
                    onClick={() => setIsReviewFormOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Action buttons — full width */}
        <div className={styles.actionRow}>
          <button className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
            <PlayIcon /> Play Now
          </button>
          <button 
            className={styles.btnWatchlist}
            onClick={handleWatchlistToggle}
          >
            {inWatchlist ? <CheckIcon /> : <PlusIcon />}
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
          <button 
            className={`${styles.btnWatched} ${watchedState ? styles.btnWatchedActive : ''}`}
            onClick={handleWatchedToggle}
          >
            <CheckIcon />
            {watchedState ? 'Watched' : 'Mark as Watched'}
          </button>
        </div>

        {watchedState && watchedDate && (
          <div className={styles.watchedLabel}>
            ✓ Watched: {watchedDate}
          </div>
        )}

        {/* Cast & Crew Section */}
        {cast.length > 0 && (
          <section className={styles.castSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>Cast &amp; Crew</h2>
              {cast.length > 7 && (
                <button
                  className={styles.viewAllBtn}
                  onClick={() => setShowAllCast(prev => !prev)}
                >
                  {showAllCast ? 'Show Less' : `View All (${cast.length})`}
                  <svg
                    width="16" height="16" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    style={{ transform: showAllCast ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
                  >
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              )}
            </div>
            <div className={styles.castGrid}>
              {(showAllCast ? cast : cast.slice(0, 7)).map((item) => (
                <div 
                  key={item.person.id} 
                  className={styles.castCard} 
                  onClick={() => handleActorClick(item.person.id, item.person.name)}
                >
                  <img 
                    src={item.person.image ? item.person.image.medium : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80'} 
                    alt={item.person.name} 
                    className={styles.castImage}
                  />
                  <div className={styles.castInfo}>
                    <div className={styles.actorName}>{item.person.name}</div>
                    <div className={styles.characterName}>{item.character.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Titles / You Might Also Like */}
        {recommendations.length > 0 && (
          <section className={styles.recommendationsSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionHeading}>You Might Also Like</h2>
            </div>
            <div className={styles.recommendationsGrid}>
              {recommendations.map((rec) => (
                <div key={rec.id} className={styles.recCard} onClick={() => navigate(`/movie/${rec.id}`)}>
                  <img src={rec.image} alt={rec.title} className={styles.recImage} />
                  <div className={styles.recOverlay}>
                    <h3 className={styles.recTitle}>{rec.title}</h3>
                    <div className={styles.recMeta}>
                      <span>⭐ {rec.rating.toFixed(1)}</span>
                      <span>{rec.year}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Actor/Crew Details Modal */}
      {selectedActor && (
        <div className={styles.actorModalOverlay} onClick={() => setSelectedActor(null)}>
          <div className={styles.actorModal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.actorModalClose} onClick={() => setSelectedActor(null)}>
              <CloseIcon />
            </button>
            {actorDetailsLoading ? (
              <div className={styles.actorModalLoading}>Loading profile...</div>
            ) : (
              <div className={styles.actorModalContent}>
                <img src={selectedActor.image} alt={selectedActor.name} className={styles.actorModalImage} />
                <div className={styles.actorModalInfo}>
                  <h3 className={styles.actorModalName}>{selectedActor.name}</h3>
                  <div className={styles.actorModalSub}>{selectedActor.knownFor}</div>
                  
                  <div className={styles.actorDetailGrid}>
                    <div>
                      <span className={styles.actorDetailLabel}>Birthday:</span>
                      <span className={styles.actorDetailVal}>{selectedActor.birthday}</span>
                    </div>
                    <div>
                      <span className={styles.actorDetailLabel}>From:</span>
                      <span className={styles.actorDetailVal}>{selectedActor.country}</span>
                    </div>
                    <div>
                      <span className={styles.actorDetailLabel}>Gender:</span>
                      <span className={styles.actorDetailVal}>{selectedActor.gender}</span>
                    </div>
                  </div>

                  <div className={styles.actorBio}>
                    <strong>Biography:</strong> {selectedActor.name} is a renowned professional recognized for contributing to various popular films and TV Shows available on MovieVerse.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <VideoPlayerModal 
        isOpen={isPlayerOpen} 
        onClose={() => setIsPlayerOpen(false)} 
        movieTitle={movie.title} 
      />
    </DashboardLayout>
  )
}
