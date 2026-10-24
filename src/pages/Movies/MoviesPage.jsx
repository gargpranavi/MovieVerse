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

import { useEffect, useRef, useCallback, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import MovieSkeletonCard from '../../member2/components/MovieSkeletonCard.jsx'
import { useInfiniteMovies } from '../../member2/hooks/useInfiniteMovies.js'
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
        root:       null,    // viewport
        rootMargin: '300px', // trigger 300 px before the sentinel reaches the fold
        threshold:  0,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
    // Re-create observer only when category changes (sentinel DOM node is stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  // ── Category change handler ───────────────────────────────────────────────
  const handleCategoryChange = useCallback((key) => {
    if (key === category) return
    setCategory(key)
  }, [category])

  // ── Hero: first loaded movie ──────────────────────────────────────────────
  const heroMovie = movies[0] ?? null

  // ── Current category display label ───────────────────────────────────────
  const currentCatLabel = CATEGORIES.find(c => c.key === category)?.label ?? 'Movies'

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Hero Banner ── */}
        <section className={styles.hero}>
          {heroMovie ? (
            <>
              <div
                className={styles.heroBg}
                style={{
                  backgroundImage: `url(${
                    heroMovie.backdrop || heroMovie.image ||
                    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80'
                  })`,
                }}
              />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>MovieVerse — {currentCatLabel}</p>
                <h1 className={styles.heroTitle}>{heroMovie.title.toUpperCase()}</h1>
                <div className={styles.heroMeta}>
                  <span>Movie</span>
                  {heroMovie.genres[0] && <><span>•</span><span>{heroMovie.genres[0]}</span></>}
                  {heroMovie.year && <><span>•</span><span>{heroMovie.year}</span></>}
                  {heroMovie.rating && <><span>•</span><span>⭐ {heroMovie.rating}</span></>}
                </div>
                {heroMovie.description && (
                  <p className={styles.heroDesc}>{heroMovie.description}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                className={styles.heroBg}
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600&q=80)',
                }}
              />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>MovieVerse — {currentCatLabel}</p>
                <h1 className={styles.heroTitle}>DISCOVER MOVIES</h1>
              </div>
            </>
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

          {/* ── Movie grid ── */}
          {!initialLoad && movies.length > 0 && (
            <div
              className={styles.grid}
              id="movies-grid"
              role="region"
              aria-label={`${currentCatLabel} movies`}
            >
              {movies.map((movie) => (
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

          {/* ── Empty state (after first load, no results) ── */}
          {!initialLoad && movies.length === 0 && !error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>🎬</span>
              <p className={styles.errorMsg}>No movies found in this category right now.</p>
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
