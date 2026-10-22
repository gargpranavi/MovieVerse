/*
   MovieVerse – MoviesPage.jsx
   Infinite-scroll Movies page (Day 3 — Member 2)

   Architecture
   ────────────
   • useInfiniteMovies() hook manages pagination state, deduplication,
     AbortController cancellation, and category-driven resets.
   • IntersectionObserver watches a 1-pixel sentinel element positioned
     below the grid; when it enters the viewport, loadMore() is called.
   • The observer is disconnected while loading or when there are no more
     pages, preventing duplicate requests from rapid scroll events.
   • Category tabs trigger a category change → the hook resets its state
     (page counter, movie list, flags) automatically via a useEffect.
   • Skeleton cards are rendered during the initial page load.
   • A spinner + "Loading…" appears at the bottom while fetching later pages.
   • If a later-page request fails, an error box with Retry appears; already-
     loaded movies remain visible.
   • An end-of-results message appears when hasMore becomes false.
*/

import { useEffect, useRef, useState, useCallback } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import { useInfiniteMovies } from '../../member2/hooks/useInfiniteMovies.js'
import styles from './MoviesPage.module.css'

// ── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'popular',     label: 'Popular' },
  { key: 'top_rated',   label: 'Top Rated' },
  { key: 'now_playing', label: 'Now Playing' },
  { key: 'upcoming',    label: 'Upcoming' },
]

// ── Skeleton placeholder ──────────────────────────────────────────────────────
function SkeletonCard() {
  return <div className={styles.skeletonCard} aria-hidden="true" />
}

// ── Retry / error icon ────────────────────────────────────────────────────────
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

  // ── Sentinel ref for IntersectionObserver ───────────────────────────────────
  const sentinelRef = useRef(null)
  // Stable ref to loadMore so the observer callback never captures a stale closure
  const loadMoreRef = useRef(loadMore)
  useEffect(() => { loadMoreRef.current = loadMore }, [loadMore])

  // ── IntersectionObserver setup ──────────────────────────────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Fire loadMore only when sentinel is intersecting and we're not busy
        if (entry.isIntersecting && !loading && hasMore) {
          loadMoreRef.current()
        }
      },
      {
        root:       null,        // viewport
        rootMargin: '200px',     // trigger 200 px before the sentinel is visible
        threshold:  0,
      }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [loading, hasMore])
  // Note: re-creating the observer when loading/hasMore changes intentionally
  // disconnects it while a fetch is active, preventing duplicate triggers.

  // ── Category change handler ─────────────────────────────────────────────────
  const handleCategoryChange = useCallback((key) => {
    if (key === category) return
    setCategory(key)
  }, [category])

  // ── Derive hero movie from first loaded card ─────────────────────────────────
  const heroMovie = movies[0] ?? null

  // ── Category display label ───────────────────────────────────────────────────
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

          {/* Category Tabs */}
          <div className={styles.tabsWrapper} role="tablist" aria-label="Movie categories">
            <span className={styles.tabsLabel}>Browse</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                id={`tab-${cat.key}`}
                role="tab"
                aria-selected={category === cat.key}
                className={`${styles.tab} ${category === cat.key ? styles.tabActive : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Fallback banner */}
          {isFallback && (
            <div className={styles.fallbackBanner} role="alert">
              <span className={styles.fallbackIcon}>📡</span>
              <span>
                TMDB is unreachable — showing local data. Connect to the internet and
                refresh to load live movies.
              </span>
            </div>
          )}

          {/* Section header */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{currentCatLabel} Movies</h2>
            {movies.length > 0 && !initialLoad && (
              <span className={styles.sectionCount}>
                {movies.length} loaded
                {totalPages !== null ? ` · page ${currentPage} of ${totalPages}` : ''}
              </span>
            )}
          </div>

          {/* ── Initial Load: skeleton grid ── */}
          {initialLoad && (
            <div className={styles.grid} aria-busy="true" aria-label="Loading movies">
              {Array.from({ length: 15 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Movie Grid ── */}
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
          <div
            ref={sentinelRef}
            className={styles.sentinel}
            aria-hidden="true"
          />

          {/* ── Loading more indicator ── */}
          {loading && !initialLoad && (
            <div className={styles.loadingMore} aria-live="polite" aria-label="Loading more movies">
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
