import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel from '../../components/MovieCarousel/MovieCarousel.jsx'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import MovieInfoModal from '../../components/MovieInfoModal/MovieInfoModal.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import { getWatchlist } from '../../utils/watchlist.js'
import { getWatched } from '../../utils/watched.js'
import { shows } from '../../data/index.js'
import styles from './HomePage.module.css'

function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

function VolumeOnIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  )
}

function VolumeMuteIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    </svg>
  )
}

export default function HomePage() {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [isInfoOpen,   setIsInfoOpen]   = useState(false)
  const [isMuted,      setIsMuted]      = useState(true)
  const heroVideoRef = useRef(null)

  // Dynamic filter state
  const [listTitle,    setListTitle]    = useState('')
  const [filteredList, setFilteredList] = useState([])

  // Parse location and filters
  const path          = location.pathname
  const searchParams  = new URLSearchParams(location.search)
  const filterGenre    = searchParams.get('genre')
  const filterNetwork  = searchParams.get('network')
  const filterLanguage = searchParams.get('language')
  const filterStatus   = searchParams.get('status')

  // Filter shows dynamically based on the current page route or query params
  useEffect(() => {
    if (path === '/watchlist') {
      setListTitle('My Watchlist')
      const watchlistIds = getWatchlist().map(item => item.id)
      setFilteredList(shows.filter(show => watchlistIds.includes(show.id)))
    } else if (path === '/watched') {
      setListTitle('Watched History')
      const watchedItems = getWatched()
      const watchedIds   = watchedItems.map(item => item.id)
      const mappedWatched = shows
        .filter(show => watchedIds.includes(show.id))
        .map(show => {
          const match = watchedItems.find(item => item.id === show.id)
          return { ...show, watchedAt: match ? match.watchedAt : null }
        })
      setFilteredList(mappedWatched)
    } else if (filterGenre) {
      setListTitle(`Genre: ${filterGenre}`)
      setFilteredList(shows.filter(show => show.genres.includes(filterGenre)))
    } else if (filterNetwork) {
      setListTitle(`Network: ${filterNetwork}`)
      setFilteredList(shows.filter(show => show.network === filterNetwork))
    } else if (filterLanguage) {
      setListTitle(`Language: ${filterLanguage}`)
      setFilteredList(shows.filter(show => (show.language || 'English') === filterLanguage))
    } else if (filterStatus) {
      setListTitle(`Status: ${filterStatus}`)
      setFilteredList(shows.filter(show => show.status === filterStatus))
    } else {
      setListTitle('')
      setFilteredList([])
    }
  }, [path, filterGenre, filterNetwork, filterLanguage, filterStatus])

  const featured   = shows[0]
  const trending   = shows.slice(1, 10)
  const topRated   = shows.slice(10, 20).sort((a, b) => b.rating - a.rating)
  const actionMovies = shows.slice(20, 30)
  const sciFi      = shows.slice(30, 40)

  // Derive a display-friendly subtitle and icon for the filter type
  const getFilterMeta = () => {
    if (path === '/watchlist') return { icon: '🔖', sub: 'Your saved titles' }
    if (path === '/watched')   return { icon: '✅', sub: 'Your watch history' }
    if (filterGenre)    return { icon: '🎭', sub: 'Browsing by genre' }
    if (filterNetwork)  return { icon: '📡', sub: 'Shows from this network' }
    if (filterLanguage) return { icon: '🌐', sub: 'Shows in this language' }
    if (filterStatus)   return { icon: '📺', sub: 'Filtered by airing status' }
    return { icon: '🎬', sub: '' }
  }

  // If a filter is active, render the premium filter page
  if (listTitle) {
    const { icon, sub } = getFilterMeta()
    const backdropImg = filteredList[0]?.image || featured?.image ||
      'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80'

    return (
      <DashboardLayout>
        <div className={styles.filterPage}>
          <div className={styles.filterHero} style={{ backgroundImage: `url(${backdropImg})` }}>
            <div className={styles.filterHeroGradient} />
            <div className={styles.filterHeroContent}>
              <button type="button" className={styles.filterBackBtn} onClick={() => navigate(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Go Back
              </button>
              <div className={styles.filterIconBadge}>{icon}</div>
              <h1 className={styles.filterHeroTitle}>{listTitle}</h1>
              {sub && <p className={styles.filterHeroSub}>{sub}</p>}
              <div className={styles.filterResultCount}>
                {filteredList.length} {filteredList.length === 1 ? 'title' : 'titles'} found
              </div>
            </div>
          </div>

          <div className={styles.filterBody}>
            {filteredList.length === 0 ? (
              <div className={styles.noResultsBox}>
                <div className={styles.noResultsIcon}>🎬</div>
                <h3>No titles found</h3>
                <p>We couldn't find anything matching this filter. Try browsing the home screen for more content.</p>
                <Link to="/home" className={styles.btnExplore}>Browse Home</Link>
              </div>
            ) : (
              <div className={styles.filterGrid}>
                {filteredList.map((movie) => (
                  <div key={movie.id} className={styles.gridCardWrapper}>
                    <MovieCard movie={movie} />
                    {movie.watchedAt && (
                      <div className={styles.watchedGridTag}>
                        ✓ Watched: {movie.watchedAt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <section className={styles.hero}>
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${featured.image})` }}
          />
          <video
            ref={heroVideoRef}
            className={styles.heroVideo}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
          <div className={styles.heroGradient} />
          
          <div className={styles.heroContent}>
            <div className={styles.netflixLogoWrap}>
              <span className={styles.nSeries}>M</span> 
              <span className={styles.seriesText}>M O V I E V E R S E   O R I G I N A L</span>
            </div>
            
            <h1 className={styles.heroTitle}>{featured.title.toUpperCase()}</h1>
            
            <div className={styles.heroMeta}>
              <span>Series</span> &bull; 
              <span>{featured.genres[0]}</span> &bull; 
              <span>{featured.year}</span> &bull; 
              <span>{featured.duration}</span> &bull; 
              <span className={styles.ageBadge}>{featured.ageRating}</span>
            </div>
            <p className={styles.heroDesc}>{featured.description}</p>
            <div className={styles.heroActions}>
              <button type="button" className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
                <PlayIcon />
                <span className={styles.btnText}>Play</span>
              </button>
              <button type="button" className={styles.btnMoreInfo} onClick={() => setIsInfoOpen(true)}>
                <InfoIcon />
                <span className={styles.btnText}>More Info</span>
              </button>
            </div>
          </div>
          
          <div className={styles.heroBottomRight}>
            <button
              className={styles.btnVolume}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              onClick={() => {
                const nextMuted = !isMuted
                setIsMuted(nextMuted)
                if (heroVideoRef.current) heroVideoRef.current.muted = nextMuted
              }}
            >
              {isMuted ? <VolumeMuteIcon /> : <VolumeOnIcon />}
            </button>
            <div className={styles.languageBadge}>U/A 16+</div>
          </div>
        </section>

        <div className={styles.content}>
          <MovieCarousel title="Trending Now"        movies={trending}    />
          <MovieCarousel title="Top 10 Today"        movies={topRated}    />
          <MovieCarousel title="Binge-Worthy Series" movies={actionMovies} />
          <MovieCarousel title="Sci-Fi & Fantasy"    movies={sciFi}       />
        </div>
      </div>

      <VideoPlayerModal 
        isOpen={isPlayerOpen} 
        onClose={() => setIsPlayerOpen(false)} 
        movieTitle={featured.title} 
      />

      <MovieInfoModal
        isOpen={isInfoOpen}
        onClose={() => setIsInfoOpen(false)}
        movie={featured}
        onPlay={() => setIsPlayerOpen(true)}
      />
    </DashboardLayout>
  )
}
