/*
   MovieVerse – MoviesPage.jsx
   Member 2 | Day 3 — Infinite-scroll Movies page

   Architecture
   ────────────
   • useInfiniteMovies() hook manages pagination state, deduplication,
     AbortController cancellation, and category-driven resets.
   • IntersectionObserver watches a 1-pixel sentinel element positioned
     below the grid. The observer is created once per category and reads
     the latest loading/hasMore state via refs — avoiding rapid
     disconnect/reconnect cycles that could miss scroll events.
   • Category tabs trigger a state reset in the hook and re-mount of the
     observer (via a key on the sentinel container).
   • MovieSkeletonCard is shown for the initial page load (15 cards).
   • A spinner + "Loading more…" appears while fetching subsequent pages.
   • If a later-page request fails, an error box with Retry appears;
     already-loaded movies remain visible.
   • An end-of-results message appears when hasMore becomes false.
   • Observer is cleaned up correctly on unmount and category change.
*/

import { useEffect, useRef, useCallback, useState, useMemo } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import MovieSkeletonCard from '../../member2/components/MovieSkeletonCard.jsx'
import { useInfiniteMovies } from '../../member2/hooks/useInfiniteMovies.js'
// Member 3: Filter and sort bar component
import FilterSortBar from '../../member3/components/FilterSortBar/FilterSortBar.jsx'
import styles from './MoviesPage.module.css'


// ── Category definitions ──────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'popular',     label: 'Popular' },
  { key: 'top_rated',   label: 'Top Rated' },
  { key: 'now_playing', label: 'Now Playing' },
  { key: 'upcoming',    label: 'Upcoming' },
]

// ── Number of skeleton cards to show on initial load ─────────────────────────
const SKELETON_COUNT = 15

// ── Retry icon ────────────────────────────────────────────────────────────────
function RetryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-4.7" />
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

export default function MoviesPage() {
  const [category, setCategory] = useState('popular')

  // ── Member 3: Filter and sort state ─────────────────────────────────────
  // sortBy controls how loaded movies are sorted
  // genre filters the displayed list to a specific genre
  const [sortBy, setSortBy] = useState('default')
  const [genre,  setGenre]  = useState('all')

  const {
    movies,
    loading,
    initialLoad,
    error,
    hasMore,
    isFallback,
    loadMore,
    retry,
    currentPage,
    totalPages,
  } = useInfiniteMovies(category)


  // ── Stable refs so the observer callback always reads the latest state ──────
  const loadMoreRef  = useRef(loadMore)
  const loadingRef2  = useRef(loading)       // "2" to avoid shadowing the hook's internal ref
  const hasMoreRef2  = useRef(hasMore)

  useEffect(() => { loadMoreRef.current  = loadMore  }, [loadMore])
  useEffect(() => { loadingRef2.current  = loading   }, [loading])
  useEffect(() => { hasMoreRef2.current  = hasMore   }, [hasMore])

  // ── Sentinel ref for IntersectionObserver ────────────────────────────────────
  const sentinelRef = useRef(null)

  // ── IntersectionObserver — created once per category, reads refs internally ─
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Always read the latest state via refs — no stale-closure risk
        if (entry.isIntersecting && !loadingRef2.current && hasMoreRef2.current) {
          loadMoreRef.current()
        }
      },
      {
        root:       null,
        rootMargin: '400px', // generous margin — fire well before sentinel reaches fold
        threshold:  0,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // Re-create observer only when category changes (sentinel DOM node is stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  // ── After initial load completes, sentinel may already be intersecting ───────
  // IntersectionObserver only fires on *changes*, so if the sentinel is still
  // in-viewport after page 1 (grid doesn't fill the screen), we must trigger
  // manually to load page 2.
  useEffect(() => {
    if (!initialLoad && hasMore && !loading) {
      const sentinel = sentinelRef.current
      if (!sentinel) return
      const rect = sentinel.getBoundingClientRect()
      // Sentinel is visible (with 400px margin)
      if (rect.top < window.innerHeight + 400) {
        loadMore()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad])

  // ── Category change handler ───────────────────────────────────────────────
  const handleCategoryChange = useCallback((key) => {
    if (key === category) return
    setCategory(key)
    // Reset filters when category changes so user starts fresh
    setSortBy('default')
    setGenre('all')
  }, [category])

  // ── Member 3: client-side filter + sort (applied to already-loaded movies) ──
  // Never mutates the original movies array — creates a copy first.
  const filteredMovies = useMemo(() => {
    // Start with a shallow copy so the original is never mutated
    let result = [...movies]

    // 1. Filter by genre (skip if 'all')
    if (genre !== 'all') {
      result = result.filter((m) => {
        // genres can be an array of strings; some() checks if any matches
        return Array.isArray(m.genres) && m.genres.some((g) => {
          if (genre === 'Animation') {
            // Match Animation OR Anime genre labels
            return g === 'Animation' || g.toLowerCase().includes('anim')
          }
          if (genre === 'Science-Fiction') {
            return g === 'Science-Fiction' || g === 'Sci-Fi' || g === 'Science Fiction'
          }
          return g === genre
        })
      })
    }

    // 2. Sort (skip if 'default' — leave in API order which is already popularity)
    if (sortBy === 'rating') {
      // Sort by TMDB vote_average descending; treat null/undefined as 0
      result = result.slice().sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    } else if (sortBy === 'release_date') {
      // Sort by year descending; year is stored as a 4-digit string e.g. "2024"
      result = result.slice().sort((a, b) => {
        const ya = parseInt(a.year, 10) || 0
        const yb = parseInt(b.year, 10) || 0
        return yb - ya
      })
    }

    return result
  }, [movies, sortBy, genre])

  // ── Clear all filters back to defaults ──────────────────────────────────
  const handleClearFilters = () => {
    setSortBy('default')
    setGenre('all')
  }

  // ── Whether any filter/sort is active ────────────────────────────────────
  const isFiltering = sortBy !== 'default' || genre !== 'all'

  // ── Stable Hero State ─────────────────────────────────────────────────────
  // Retains the previous valid hero across category switches so the hero
  // NEVER disappears, flashes "DISCOVER MOVIES", or flashes pink placeholders.
  const [hero, setHero] = useState(null)
  const [heroCategoryLabel, setHeroCategoryLabel] = useState('Popular')

  // Current category display label
  const currentCatLabel = CATEGORIES.find(c => c.key === category)?.label ?? 'Movies'

  // Update hero only when valid movies for the category arrive
  useEffect(() => {
    if (!movies || movies.length === 0) return

    const candidate = movies[0]
    if (!candidate) return

    // If candidate has an image, preload it before updating hero state
    // so the visible background never flashes blank or changes prematurely.
    const candidateBg = candidate.backdrop || candidate.image
    if (candidateBg) {
      const img = new Image()
      img.src = candidateBg
      const applyHero = () => {
        setHero(candidate)
        setHeroCategoryLabel(currentCatLabel)
      }
      img.onload = applyHero
      img.onerror = applyHero
    } else {
      setHero(candidate)
      setHeroCategoryLabel(currentCatLabel)
    }
  }, [movies, currentCatLabel])

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Hero Banner ── */}
        <section className={styles.hero} aria-label="Featured hero">
          {hero ? (
            <>
              <div
                className={styles.heroBg}
                style={{
                  backgroundImage: `url(${hero.backdrop || hero.image})`,
                }}
              />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>MovieVerse — {heroCategoryLabel}</p>
                <h1 className={styles.heroTitle}>{hero.title.toUpperCase()}</h1>
                <div className={styles.heroMeta}>
                  <span>Movie</span>
                  {hero.genres?.[0] && <><span>•</span><span>{hero.genres[0]}</span></>}
                  {hero.year && <><span>•</span><span>{hero.year}</span></>}
                  {hero.rating && <><span>•</span><span>⭐ {hero.rating}</span></>}
                </div>
                {hero.description && (
                  <p className={styles.heroDesc}>{hero.description}</p>
                )}
              </div>
            </>
          ) : (
            /* ── Initial Load Neutral Skeleton (Zero Layout Shift, No Flash) ── */
            <div className={styles.heroSkeletonWrapper} aria-hidden="true">
              <div className={styles.heroSkeletonBg} />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <div className={styles.skeletonPill} />
                <div className={styles.skeletonTitle} />
                <div className={styles.skeletonMetaRow} />
                <div className={styles.skeletonDescLine} />
                <div className={styles.skeletonDescLineShort} />
              </div>
            </div>
          )}
        </section>

        {/* ── Content ── */}
        <div className={styles.content}>

          {/* ── Category Tabs ── */}
          <div className={styles.tabsWrapper} role="tablist" aria-label="Movie categories">
            <span className={styles.tabsLabel}>Browse</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                id={`tab-movies-${cat.key}`}
                role="tab"
                aria-selected={category === cat.key}
                className={`${styles.tab} ${category === cat.key ? styles.tabActive : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* ── Fallback banner ── */}
          {isFallback && (
            <div className={styles.fallbackBanner} role="alert">
              <span className={styles.fallbackIcon}>📡</span>
              <span>
                TMDB is unreachable — showing local data. Connect to the internet and
                refresh to load live movies.
              </span>
            </div>
          )}

          {/* ── Section header ── */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{currentCatLabel} Movies</h2>
            {movies.length > 0 && !initialLoad && (
              <span className={styles.sectionCount}>
                {movies.length} loaded
                {totalPages !== null ? ` · page ${currentPage} of ${totalPages}` : ''}
              </span>
            )}
          </div>

          {/* ── Member 3: Filter and Sort controls ─────────────────────── */}
          {/* Only show when movies are loaded; does not replace infinite scroll */}
          {!initialLoad && (
            <FilterSortBar
              sortBy={sortBy}
              genre={genre}
              onSortChange={setSortBy}
              onGenreChange={setGenre}
              onClear={handleClearFilters}
              filteredCount={filteredMovies.length}
              totalCount={movies.length}
              isFiltering={isFiltering}
            />
          )}

          {/* ── Initial load: skeleton grid ── */}
          {initialLoad && (
            <div
              className={styles.grid}
              aria-busy="true"
              aria-label="Loading movies"
              id="movies-skeleton-grid"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <MovieSkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Movie grid — renders filteredMovies (client-side filtered/sorted) ── */}
          {!initialLoad && movies.length > 0 && (
            <div
              className={styles.grid}
              id="movies-grid"
              role="region"
              aria-label={`${currentCatLabel} movies`}
            >
              {/* Render filteredMovies so genre/sort applies immediately */}
              {filteredMovies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}

              {/* ── Inline skeleton cards while loading more pages ── */}
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <MovieSkeletonCard key={`skel-more-${i}`} />
                ))
              )}
            </div>
          )}

          {/* ── Empty state: no movies from API at all ── */}
          {!initialLoad && movies.length === 0 && !error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>🎬</span>
              <p className={styles.errorMsg}>No movies found in this category right now.</p>
            </div>
          )}

          {/* ── Member 3: Empty state when filters produce no results ── */}
          {!initialLoad && movies.length > 0 && filteredMovies.length === 0 && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>🔍</span>
              <p className={styles.errorMsg}>
                No movies match the selected filters. Try a different genre or sort option, or{' '}
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--gold-mid)', cursor: 'pointer', fontWeight: 700, fontSize: 'inherit', padding: 0 }}
                  onClick={handleClearFilters}
                >
                  clear filters
                </button>.
              </p>
            </div>
          )}

          {/* ── Sentinel element (IntersectionObserver target) ── */}
          {/*    Placed outside the grid so it's always in the DOM  */}
          <div
            ref={sentinelRef}
            className={styles.sentinel}
            aria-hidden="true"
            data-testid="infinite-scroll-sentinel"
          />

          {/* ── "Loading more" text indicator (below the grid) ── */}
          {loading && !initialLoad && (
            <div
              className={styles.loadingMore}
              aria-live="polite"
              aria-label="Loading more movies"
            >
              <div className={styles.spinner} />
              <span className={styles.loadingText}>Loading more…</span>
            </div>
          )}

          {/* ── Per-page error with Retry ── */}
          {error && !loading && (
            <div className={styles.errorBox} role="alert">
              <span className={styles.errorIcon}>⚠️</span>
              <p className={styles.errorMsg}>{error}</p>
              <button
                id="retry-movies-btn"
                className={styles.retryBtn}
                onClick={retry}
                aria-label="Retry loading movies"
                type="button"
              >
                <RetryIcon />
                Retry
              </button>
            </div>
          )}

          {/* ── End of results ── */}
          {!hasMore && !loading && movies.length > 0 && !isFallback && (
            <div className={styles.endMessage} aria-live="polite">
              <div className={styles.endDivider} />
              <span>You&apos;ve reached the end</span>
              <span>{movies.length} movies loaded</span>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
