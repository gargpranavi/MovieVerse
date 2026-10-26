/*
   MovieVerse – HomePage.jsx
   Updated Day 5: Hero + carousels now use live TMDB data via useTmdb.
   Falls back to local shows.js automatically if TMDB is unreachable.
   All filter-page behaviour (watchlist / watched / genre / network) is preserved
   and still uses local data (those items are stored locally by ID).
*/

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import DashboardLayout    from '../../components/layout/DashboardLayout.jsx'
import MovieCarousel      from '../../components/MovieCarousel/MovieCarousel.jsx'
import VideoPlayerModal   from '../../components/VideoPlayerModal/VideoPlayerModal.jsx'
import MovieInfoModal     from '../../components/MovieInfoModal/MovieInfoModal.jsx'
import MovieCard          from '../../components/MovieCard/MovieCard.jsx'
import MovieSkeletonCard  from '../../member2/components/MovieSkeletonCard.jsx'
import { useWatchlist }        from '../../context/index.js'
import { useToast }            from '../../components/common/Toast/index.js'
import { shows }          from '../../data/index.js'
import { useTmdb }        from '../../member2/hooks/useTmdb.js'
import { useInfiniteScroll } from '../../member2/hooks/useInfiniteScroll.js'
import {
  fetchTrending,
  fetchTopRatedMovies,
  fetchNowPlayingMovies,
  fetchPopularTvShows,
} from '../../member2/services/tmdbApi.js'
import styles from './HomePage.module.css'

// Stable fetch map for the Discover section — defined outside to avoid re-renders
const DISCOVER_FETCH_MAP = {
  trending: (page) => fetchTrending('movie', 'week', page),
}

// ── Icons ─────────────────────────────────────────────────────────────────────

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

// ── Skeleton row while a carousel is loading ──────────────────────────────────

function CarouselSkeleton({ title }) {
  return (
    <div className={styles.carouselSkeletonSection}>
      {title && <h2 className={styles.carouselSkeletonTitle}>{title}</h2>}
      <div className={styles.carouselSkeletonRow}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={styles.carouselSkeletonItem}>
            <MovieSkeletonCard />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Fallback Banner ───────────────────────────────────────────────────────────

function FallbackBanner() {
  return (
    <div className={styles.fallbackBanner} role="alert">
      <span className={styles.fallbackIcon}>📡</span>
      <span>
        TMDB is unreachable — showing local data. Connect to the internet and
        refresh to load live movies.
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const location     = useLocation()
  const navigate     = useNavigate()
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)
  const [isInfoOpen,   setIsInfoOpen]   = useState(false)
  const [isMuted,      setIsMuted]      = useState(true)
  const heroVideoRef = useRef(null)

  // ── Context ────────────────────────────────────────────────────────────────
  const {
    watchlist,
    watchedHistory,
    isInWatchlist,
    toggleWatchlist,
  } = useWatchlist()
  const { toast } = useToast()

  // Dynamic filter state (watchlist / watched / genre / network / language / status)
  const [listTitle,    setListTitle]    = useState('')
  const [filteredList, setFilteredList] = useState([])

  // Route / query param parsing
  const path           = location.pathname
  const searchParams   = new URLSearchParams(location.search)
  const filterGenre    = searchParams.get('genre')
  const filterNetwork  = searchParams.get('network')
  const filterLanguage = searchParams.get('language')
  const filterStatus   = searchParams.get('status')

  // ── TMDB Live Data ──────────────────────────────────────────────────────────
  const {
    data: trending,
    loading: trendingLoading,
    isFallback: trendingFallback,
  } = useTmdb(fetchTrending, ['movie', 'week', 1])

  const {
    data: topRated,
    loading: topRatedLoading,
    isFallback: topRatedFallback,
  } = useTmdb(fetchTopRatedMovies, [1])

  const {
    data: nowPlaying,
    loading: nowPlayingLoading,
    isFallback: nowPlayingFallback,
  } = useTmdb(fetchNowPlayingMovies, [1])

  const {
    data: popularTV,
    loading: popularTVLoading,
    isFallback: popularTVFallback,
  } = useTmdb(fetchPopularTvShows, [1])

  // Hero uses first trending movie; falls back to local shows[0] while loading
  const featured   = trending[0] ?? shows[0]
  const anyFallback = trendingFallback || topRatedFallback || nowPlayingFallback || popularTVFallback

  // Hero watchlist state — reactive from context
  const heroInWatchlist = featured ? isInWatchlist(featured.id) : false

  // ── Discover Movies infinite scroll ─────────────────────────────────────────
  const {
    items:       discoverItems,
    loading:     discoverLoading,
    initialLoad: discoverInitialLoad,
    hasMore:     discoverHasMore,
    loadMore:    discoverLoadMore,
    isFallback:  discoverFallback,
  } = useInfiniteScroll(DISCOVER_FETCH_MAP, 'trending')

  // Sentinel + stable refs so the observer never captures stale closures
  const discoverSentinelRef  = useRef(null)
  const discoverLoadMoreRef  = useRef(discoverLoadMore)
  const discoverLoadingRef   = useRef(discoverLoading)
  const discoverHasMoreRef   = useRef(discoverHasMore)

  useEffect(() => { discoverLoadMoreRef.current = discoverLoadMore }, [discoverLoadMore])
  useEffect(() => { discoverLoadingRef.current  = discoverLoading  }, [discoverLoading])
  useEffect(() => { discoverHasMoreRef.current  = discoverHasMore  }, [discoverHasMore])

  // IntersectionObserver — watches the sentinel at the bottom of the discover grid
  useEffect(() => {
    const sentinel = discoverSentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !discoverLoadingRef.current && discoverHasMoreRef.current) {
          discoverLoadMoreRef.current()
        }
      },
      { root: null, rootMargin: '400px', threshold: 0 }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, []) // mount once — sentinel never moves

  // After page 1 loads, sentinel may still be in-viewport → trigger page 2 manually
  useEffect(() => {
    if (!discoverInitialLoad && discoverHasMore && !discoverLoading) {
      const sentinel = discoverSentinelRef.current
      if (!sentinel) return
      const rect = sentinel.getBoundingClientRect()
      if (rect.top < window.innerHeight + 400) discoverLoadMore()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discoverInitialLoad])

  // ── Filter / watchlist pages (still use local shows for stored IDs) ─────────
  useEffect(() => {
    if (path === '/watchlist') {
      setListTitle('My Watchlist')
      setFilteredList(watchlist)
    } else if (path === '/watched') {
      setListTitle('Watched History')
      setFilteredList(watchedHistory)
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
  }, [path, filterGenre, filterNetwork, filterLanguage, filterStatus, watchlist, watchedHistory])

  const getFilterMeta = () => {
    if (path === '/watchlist') return { icon: '🔖', sub: 'Your saved titles' }
    if (path === '/watched')   return { icon: '✅', sub: 'Your watch history' }
    if (filterGenre)    return { icon: '🎭', sub: 'Browsing by genre' }
    if (filterNetwork)  return { icon: '📡', sub: 'Shows from this network' }
    if (filterLanguage) return { icon: '🌐', sub: 'Shows in this language' }
    if (filterStatus)   return { icon: '📺', sub: 'Filtered by airing status' }
    return { icon: '🎬', sub: '' }
  }

  // ── Filter page render ────────────────────────────────────────────────────
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

  // ── Main Home Page ────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Hero Banner ── */}
        <section className={styles.hero}>
          <div
            className={styles.heroBg}
            style={{
              backgroundImage: `url(${
                featured?.backdrop || featured?.image ||
                'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80'
              })`,
            }}
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
              <span className={styles.nSeries}>M</span>{' '}
              <span className={styles.seriesText}>M O V I E V E R S E   O R I G I N A L</span>
            </div>

            <h1 className={styles.heroTitle}>
              {featured ? featured.title.toUpperCase() : 'DISCOVER MOVIES'}
            </h1>

            <div className={styles.heroMeta}>
              {featured?.genres?.[0] && (
                <><span>{featured.genres[0]}</span> &bull; </>
              )}
              {featured?.year && <><span>{featured.year}</span> &bull; </>}
              {featured?.duration && <><span>{featured.duration}</span> &bull; </>}
              {featured?.ageRating && (
                <span className={styles.ageBadge}>{featured.ageRating}</span>
              )}
            </div>

            {featured?.description && (
              <p className={styles.heroDesc}>{featured.description.slice(0, 200)}{featured.description.length > 200 ? '…' : ''}</p>
            )}

            <div className={styles.heroActions}>
              <button type="button" className={styles.btnPlay} onClick={() => setIsPlayerOpen(true)}>
                <PlayIcon />
                <span className={styles.btnText}>Play</span>
              </button>
              <button
                type="button"
                className={styles.btnMoreInfo}
                onClick={() => {
                  if (featured) {
                    const willAdd = !heroInWatchlist
                    toggleWatchlist(featured)
                    const title = featured.title || featured.name || 'Title'
                    if (willAdd) {
                      toast.addedToWatchlist(title)
                    } else {
                      toast.info(`Removed '${title}' from Watchlist`)
                    }
                  }
                }}
                aria-label={heroInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {heroInWatchlist ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                )}
                <span className={styles.btnText}>{heroInWatchlist ? 'In Watchlist' : 'Watchlist'}</span>
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

        {/* ── Carousels ── */}
        <div className={styles.content}>

          {/* Fallback notice when offline */}
          {anyFallback && <FallbackBanner />}

          {/* Trending This Week */}
          {trendingLoading
            ? <CarouselSkeleton title="Trending This Week" />
            : <MovieCarousel title="Trending This Week" movies={trending} />
          }

          {/* Top Rated Movies */}
          {topRatedLoading
            ? <CarouselSkeleton title="Top Rated Movies" />
            : <MovieCarousel title="Top Rated Movies" movies={topRated} />
          }

          {/* Now Playing in Theatres */}
          {nowPlayingLoading
            ? <CarouselSkeleton title="Now Playing" />
            : <MovieCarousel title="Now Playing in Theatres" movies={nowPlaying} />
          }

          {/* Popular TV Series */}
          {popularTVLoading
            ? <CarouselSkeleton title="Popular TV Series" />
            : <MovieCarousel title="Popular TV Series" movies={popularTV} />
          }

        </div>

        {/* ── Discover More — infinite scroll grid ── */}
        <section className={styles.discoverSection}>
          <div className={styles.discoverHeader}>
            <h2 className={styles.discoverTitle}>Discover Movies</h2>
            <span className={styles.discoverCount}>
              {discoverItems.length > 0 ? `${discoverItems.length} loaded` : ''}
            </span>
          </div>

          {/* Fallback notice (offline) */}
          {discoverFallback && (
            <div className={styles.fallbackBanner} role="alert">
              <span className={styles.fallbackIcon}>📡</span>
              <span>Showing local data — connect to the internet for live results.</span>
            </div>
          )}

          {/* Skeleton on first load */}
          {discoverInitialLoad ? (
            <div className={styles.discoverGrid}>
              {Array.from({ length: 15 }).map((_, i) => (
                <MovieSkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className={styles.discoverGrid}>
              {discoverItems.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
              {/* Inline skeletons while fetching next page */}
              {discoverLoading && !discoverInitialLoad &&
                Array.from({ length: 5 }).map((_, i) => (
                  <MovieSkeletonCard key={`sk-${i}`} />
                ))
              }
            </div>
          )}

          {/* Sentinel — IntersectionObserver target */}
          <div
            ref={discoverSentinelRef}
            className={styles.discoverSentinel}
            aria-hidden="true"
          />

          {/* Loading more indicator */}
          {discoverLoading && !discoverInitialLoad && (
            <div className={styles.discoverLoadingMore}>
              <div className={styles.discoverSpinner} />
              <span>Loading more…</span>
            </div>
          )}

          {/* End of results */}
          {!discoverHasMore && !discoverLoading && discoverItems.length > 0 && (
            <div className={styles.discoverEnd}>
              <div className={styles.discoverEndLine} />
              <span>You&apos;ve seen it all — {discoverItems.length} movies loaded</span>
              <div className={styles.discoverEndLine} />
            </div>
          )}
        </section>
      </div>

      <VideoPlayerModal
        isOpen={isPlayerOpen}
        onClose={() => setIsPlayerOpen(false)}
        movieTitle={featured?.title || 'MovieVerse'}
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
