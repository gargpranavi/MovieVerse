/* =============================================
   MovieVerse – AnimePage.jsx
   Member 2 | Anime Hub Page

   Works entirely on local animeData.js —
   same pattern as HomePage.jsx uses shows.js.
   No API calls. No loading states. Instant render.
   ============================================= */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import AnimeCarousel from '../components/AnimeCarousel.jsx'
import VideoPlayerModal from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import {
  fallbackAnime,
  fallbackMovies,
  fallbackAction,
  fallbackRomance,
  fallbackFantasy,
  fallbackComedy,
} from '../data/animeData.js'
import { isInWatchlist, toggleWatchlist } from '../../utils/watchlist.js'
import styles from './AnimePage.module.css'

/* ── Icons ───────────────────────────────────── */
function PlayIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  )
}

/* ════════════════════════════════════════════════
   Derive all sections from local data
   (mirrors how HomePage.jsx slices shows[])
   ════════════════════════════════════════════════ */

const featured    = fallbackAnime[0]
const trending    = fallbackAnime.slice(1, 10)
const topRated    = [...fallbackAnime]
  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
  .slice(0, 10)
const airingNow   = fallbackAnime.filter(a => a.status === 'Currently Airing')
const movies      = fallbackMovies
const actionList  = fallbackAction.slice(0, 10)
const romanceList = fallbackRomance.slice(0, 10)
const fantasyList = fallbackFantasy.slice(0, 10)
const comedyList  = fallbackComedy.slice(0, 10)

/* ════════════════════════════════════════════════
   AnimePage
   ════════════════════════════════════════════════ */
export default function AnimePage() {
  const navigate = useNavigate()

  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [inWatchlist,  setInWatchlist]  = useState(false)

  // Sync watchlist button state
  useEffect(() => {
    setInWatchlist(isInWatchlist(featured.id))
    const handle = () => setInWatchlist(isInWatchlist(featured.id))
    window.addEventListener('watchlistUpdated', handle)
    return () => window.removeEventListener('watchlistUpdated', handle)
  }, [])

  const handleWatchlistToggle = () => toggleWatchlist(featured)
  const handleMoreInfo        = () => navigate(`/anime/${featured.id}`)

  /* ── Hero image / fallback ─────────────────── */
  const HERO_FALLBACK = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1600&q=80'
  const heroImage     = featured?.banner || featured?.image || HERO_FALLBACK

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ════════════════════════════════════════
            HERO SECTION
            ════════════════════════════════════════ */}
        <section className={styles.hero}>
          {/* Background image */}
          <div
            className={styles.heroBg}
            style={{ backgroundImage: `url(${heroImage})` }}
          />

          {/* Gradient overlays */}
          <div className={styles.heroGradient} />

          {/* Content */}
          <div className={styles.heroContent}>
            {/* Badge — mirrors "M MOVIEVERSE ORIGINAL" from HomePage */}
            <div className={styles.animeBadgeWrap}>
              <span className={styles.animeLetter}>A</span>
              <span className={styles.animeText}>M O V I E V E R S E   A N I M E</span>
            </div>

            <h1 className={styles.heroTitle}>
              {featured.title?.toUpperCase()}
            </h1>

            <div className={styles.heroMeta}>
              {featured.type && <span>{featured.type}</span>}
              {featured.genres?.[0] && <><span>•</span><span>{featured.genres[0]}</span></>}
              {featured.year && featured.year !== 'N/A' && (
                <><span>•</span><span>{featured.year}</span></>
              )}
              {featured.episodes && (
                <><span>•</span><span>{featured.episodes} eps</span></>
              )}
              {featured.rating && (
                <><span>•</span><span className={styles.ratingBadge}>★ {Number(featured.rating).toFixed(1)}</span></>
              )}
              {featured.ageRating && (
                <span className={styles.ageBadge}>{featured.ageRating}</span>
              )}
            </div>

            <p className={styles.heroDesc}>{featured.description}</p>

            <div className={styles.heroActions}>
              <button
                type="button"
                className={styles.btnPlay}
                onClick={() => setIsPlayerOpen(true)}
              >
                <PlayIcon />
                <span>Play</span>
              </button>

              <button
                type="button"
                className={styles.btnWatchlist}
                onClick={handleWatchlistToggle}
              >
                {inWatchlist ? <CheckIcon /> : <PlusIcon />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                type="button"
                className={styles.btnMoreInfo}
                onClick={handleMoreInfo}
              >
                <InfoIcon />
                <span>More Info</span>
              </button>
            </div>
          </div>

          {/* Genre pills — bottom right */}
          <div className={styles.heroBottomRight}>
            {(featured.genres || []).slice(0, 3).map((g, i) => (
              <span key={i} className={styles.genrePill}>{g}</span>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════
            CAROUSEL ROWS
            Mirrors HomePage.jsx structure exactly
            ════════════════════════════════════════ */}
        <div className={styles.content}>
          <AnimeCarousel title="Trending Now"        movies={trending}    />
          <AnimeCarousel title="Top 10 Anime"        movies={topRated}    isNumbered />
          <AnimeCarousel title="Currently Airing"    movies={airingNow}   />
          <AnimeCarousel title="Anime Movies"        movies={movies}      />
          <AnimeCarousel title="⚔️  Action Anime"    movies={actionList}  />
          <AnimeCarousel title="💕  Romance Anime"   movies={romanceList} />
          <AnimeCarousel title="✨  Fantasy Anime"   movies={fantasyList} />
          <AnimeCarousel title="😄  Comedy Anime"    movies={comedyList}  />
        </div>
      </div>

      {/* Video Player Modal — reused from existing components */}
      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        movieTitle={featured?.title || 'Anime'}
      />
    </DashboardLayout>
  )
}
