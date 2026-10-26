/*
   MovieVerse – TvSeriesPage.jsx
   Member 2 | Day 4 — Infinite-scroll TV Series page

   Architecture
   ────────────
   • useInfiniteScroll() hook (shared with Movies) manages pagination,
     deduplication, AbortController cancellation, and category resets.
   • IntersectionObserver watches a 1-pixel sentinel below the grid.
     It is created once per category and reads live state via refs so
     rapid scroll events never trigger duplicate fetches.
   • Four category tabs: Popular · Top Rated · Airing Today · On The Air.
   • MovieSkeletonCard (reused from Day 3) renders 15 placeholders on
     the initial load, then 5 inline while subsequent pages load.
   • Per-page errors show a Retry button; already-loaded cards remain.
   • End-of-results message appears when hasMore becomes false.
   • If TMDB is unreachable the local-data fallback is surfaced with a banner.
   • Observer cleaned up correctly on unmount and category change.
*/

import { useEffect, useRef, useCallback, useState } from 'react'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import MovieCard from '../../components/MovieCard/MovieCard.jsx'
import MovieSkeletonCard from '../../member2/components/MovieSkeletonCard/MovieSkeletonCard.jsx'
import { useInfiniteScroll } from '../../member2/hooks/useInfiniteScroll.js'
import {
  fetchPopularTvShows,
  fetchTopRatedTvShows,
  fetchAiringTodayTvShows,
  fetchOnTheAirTvShows,
} from '../../member2/services/tmdbApi.js'
import styles from './TvSeriesPage.module.css'

// ── Category → fetch function map ─────────────────────────────────────────────
const TV_FETCH_MAP = {
  popular:      fetchPopularTvShows,
  top_rated:    fetchTopRatedTvShows,
  airing_today: fetchAiringTodayTvShows,
  on_the_air:   fetchOnTheAirTvShows,
}

// ── Category tab definitions ──────────────────────────────────────────────────
const CATEGORIES = [
  { key: 'popular',      label: 'Popular' },
  { key: 'top_rated',    label: 'Top Rated' },
  { key: 'airing_today', label: 'Airing Today' },
  { key: 'on_the_air',   label: 'On The Air' },
]

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

export default function TvSeriesPage() {
  const [category, setCategory] = useState('popular')

  const {
    items: shows,
    loading,
    initialLoad,
    error,
    hasMore,
    isFallback,
    loadMore,
    retry,
    currentPage,
    totalPages,
  } = useInfiniteScroll(TV_FETCH_MAP, category)

  // ── Stable refs so the observer callback reads the latest state ────────────
  const loadMoreRef = useRef(loadMore)
  const loadingRef2 = useRef(loading)
  const hasMoreRef2 = useRef(hasMore)

  useEffect(() => { loadMoreRef.current = loadMore  }, [loadMore])
  useEffect(() => { loadingRef2.current = loading   }, [loading])
  useEffect(() => { hasMoreRef2.current = hasMore   }, [hasMore])

  // ── Sentinel ref ─────────────────────────────────────────────────────────
  const sentinelRef = useRef(null)

  // ── IntersectionObserver — created once per category ────────────────────
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  // ── After initial load, sentinel may already be intersecting ────────────
  // IntersectionObserver only fires on *changes*: if page 1 cards don't push
  // the sentinel offscreen, we manually trigger loadMore so page 2 starts.
  useEffect(() => {
    if (!initialLoad && hasMore && !loading) {
      const sentinel = sentinelRef.current
      if (!sentinel) return
      const rect = sentinel.getBoundingClientRect()
      if (rect.top < window.innerHeight + 400) {
        loadMore()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLoad])

  // ── Category change handler ─────────────────────────────────────────────
  const handleCategoryChange = useCallback((key) => {
    if (key === category) return
    setCategory(key)
  }, [category])

  // ── Hero: first loaded show ─────────────────────────────────────────────
  const heroShow = shows[0] ?? null

  // ── Current category label ──────────────────────────────────────────────
  const currentCatLabel = CATEGORIES.find(c => c.key === category)?.label ?? 'TV Series'

  return (
    <DashboardLayout>
      <div className={styles.page}>

        {/* ── Hero Banner ── */}
        <section className={styles.hero}>
          {heroShow ? (
            <>
              <div
                className={styles.heroBg}
                style={{
                  backgroundImage: `url(${
                    heroShow.backdrop || heroShow.image ||
                    'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1600&q=80'
                  })`,
                }}
              />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>MovieVerse — {currentCatLabel}</p>
                <h1 className={styles.heroTitle}>{heroShow.title.toUpperCase()}</h1>
                <div className={styles.heroMeta}>
                  <span>Series</span>
                  {heroShow.genres[0] && <><span>•</span><span>{heroShow.genres[0]}</span></>}
                  {heroShow.year && <><span>•</span><span>{heroShow.year}</span></>}
                  {heroShow.rating && <><span>•</span><span>⭐ {heroShow.rating}</span></>}
                </div>
                {heroShow.description && (
                  <p className={styles.heroDesc}>{heroShow.description}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div
                className={styles.heroBg}
                style={{
                  backgroundImage:
                    'url(https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=1600&q=80)',
                }}
              />
              <div className={styles.heroGradient} />
              <div className={styles.heroContent}>
                <p className={styles.heroLabel}>MovieVerse — {currentCatLabel}</p>
                <h1 className={styles.heroTitle}>DISCOVER TV SERIES</h1>
              </div>
            </>
          )}
        </section>

        {/* ── Content ── */}
        <div className={styles.content}>

          {/* ── Category Tabs ── */}
          <div className={styles.tabsWrapper} role="tablist" aria-label="TV Series categories">
            <span className={styles.tabsLabel}>Browse</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                id={`tab-tv-${cat.key}`}
                role="tab"
                aria-selected={category === cat.key}
                className={`${styles.tab} ${category === cat.key ? styles.tabActive : ''}`}
                onClick={() => handleCategoryChange(cat.key)}
                type="button"
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
                refresh to load live TV series.
              </span>
            </div>
          )}

          {/* ── Section header ── */}
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{currentCatLabel} TV Series</h2>
            {shows.length > 0 && !initialLoad && (
              <span className={styles.sectionCount}>
                {shows.length} loaded
                {totalPages !== null ? ` · page ${currentPage} of ${totalPages}` : ''}
              </span>
            )}
          </div>

          {/* ── Initial load: skeleton grid ── */}
          {initialLoad && (
            <div
              className={styles.grid}
              aria-busy="true"
              aria-label="Loading TV series"
              id="tv-series-skeleton-grid"
            >
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <MovieSkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── TV Series grid ── */}
          {!initialLoad && shows.length > 0 && (
            <div
              className={styles.grid}
              id="tv-series-grid"
              role="region"
              aria-label={`${currentCatLabel} TV series`}
            >
              {shows.map((show) => (
                <MovieCard key={show.id} movie={show} />
              ))}

              {/* ── Inline skeleton cards while loading more pages ── */}
              {loading && (
                Array.from({ length: 5 }).map((_, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <MovieSkeletonCard key={`skel-tv-more-${i}`} />
                ))
              )}
            </div>
          )}

          {/* ── Empty state ── */}
          {!initialLoad && shows.length === 0 && !error && (
            <div className={styles.errorBox}>
              <span className={styles.errorIcon}>📺</span>
              <p className={styles.errorMsg}>No TV series found in this category right now.</p>
            </div>
          )}

          {/* ── Sentinel (IntersectionObserver target) ── */}
          <div
            ref={sentinelRef}
            className={styles.sentinel}
            aria-hidden="true"
            data-testid="tv-infinite-scroll-sentinel"
          />

          {/* ── Loading more indicator ── */}
          {loading && !initialLoad && (
            <div
              className={styles.loadingMore}
              aria-live="polite"
              aria-label="Loading more TV series"
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
                id="retry-tv-btn"
                className={styles.retryBtn}
                onClick={retry}
                aria-label="Retry loading TV series"
                type="button"
              >
                <RetryIcon />
                Retry
              </button>
            </div>
          )}

          {/* ── End of results ── */}
          {!hasMore && !loading && shows.length > 0 && !isFallback && (
            <div className={styles.endMessage} aria-live="polite">
              <div className={styles.endDivider} />
              <span>You&apos;ve reached the end</span>
              <span>{shows.length} series loaded</span>
            </div>
          )}

        </div>
      </div>
    </DashboardLayout>
  )
}
