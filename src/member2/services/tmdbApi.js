/*
   MovieVerse – tmdbApi.js
   Member 2 | TMDB v3 REST API Service

   Base URL  : https://api.themoviedb.org/3
   Image CDN : https://image.tmdb.org/t/p/{size}{poster_path}
   Auth      : Bearer token via VITE_TMDB_API_KEY (set in project-root .env)

   Caching   : sessionStorage, 5-minute TTL (mirrors animeApi.js convention)
   Fallback  : On any failure, callers receive { isFallback: true, data: shows[] }
               sourced from the existing local shows.js dataset.

   All public functions return a consistent ApiResult object:
   {
     success     : boolean,
     data        : NormalisedShow[],
     source      : 'tmdb' | 'cache' | 'fallback' | 'error',
     isFallback  : boolean,
     page        : number | null,
     totalPages  : number | null,
     error       : string | null,
   }

   Normalised show shape (compatible with MovieCard / MovieCarousel):
   {
     id          : string   – prefixed "tmdb-{id}" to avoid local ID collision
     tmdbId      : number   – raw TMDB numeric ID
     mediaType   : 'movie' | 'tv'
     title       : string
     year        : string
     duration    : string
     ageRating   : string
     genres      : string[]
     description : string
     image       : string | null  – full CDN URL (w500 poster)
     backdrop    : string | null  – full CDN URL (w1280 backdrop)
     rating      : number | null
     language    : string
     network     : string
     status      : string
     source      : 'tmdb'   – always set on live/cached results
   }
*/

import { shows as localShows } from '../../data/index.js'

// ─── Constants ───────────────────────────────────────────────────────────────

const TMDB_BASE      = 'https://api.themoviedb.org/3'
const IMAGE_BASE_W92  = 'https://image.tmdb.org/t/p/w92'
const IMAGE_BASE_W185 = 'https://image.tmdb.org/t/p/w185'
const IMAGE_BASE_W500 = 'https://image.tmdb.org/t/p/w500'
const IMAGE_BASE_W780 = 'https://image.tmdb.org/t/p/w780'
const IMAGE_BASE_W1280 = 'https://image.tmdb.org/t/p/w1280'
const IMAGE_BASE_ORIG  = 'https://image.tmdb.org/t/p/original'

export const TMDB_IMAGE_SIZES = {
  poster:   { sm: IMAGE_BASE_W185, md: IMAGE_BASE_W500, lg: IMAGE_BASE_ORIG },
  backdrop: { sm: IMAGE_BASE_W780, md: IMAGE_BASE_W1280, lg: IMAGE_BASE_ORIG },
  face:     { sm: IMAGE_BASE_W92,  md: IMAGE_BASE_W185, lg: IMAGE_BASE_ORIG },
}

const CACHE_TTL_MS = 5 * 60 * 1000  // 5 minutes

//  TMDB Genre Maps 
// TMDB list endpoints return genre_ids (not names). These maps resolve them.

export const MOVIE_GENRE_MAP = {
  28:    'Action',
  12:    'Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  14:    'Fantasy',
  36:    'History',
  27:    'Horror',
  10402: 'Music',
  9648:  'Mystery',
  10749: 'Romance',
  878:   'Science-Fiction',
  10770: 'TV Movie',
  53:    'Thriller',
  10752: 'War',
  37:    'Western',
}

export const TV_GENRE_MAP = {
  10759: 'Action & Adventure',
  16:    'Animation',
  35:    'Comedy',
  80:    'Crime',
  99:    'Documentary',
  18:    'Drama',
  10751: 'Family',
  10762: 'Kids',
  9648:  'Mystery',
  10763: 'News',
  10764: 'Reality',
  10765: 'Science-Fiction',
  10766: 'Soap',
  10767: 'Talk',
  10768: 'War & Politics',
  37:    'Western',
}

//  Cache Helpers (sessionStorage, 5-min TTL) 

function cacheKey(label) {
  return `tmdb_cache_${label}`
}

function readCache(label) {
  try {
    const raw = sessionStorage.getItem(cacheKey(label))
    if (!raw) return null

    const parsed = JSON.parse(raw)

    // Guard against malformed cache entries
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('data' in parsed) ||
      !('expiresAt' in parsed)
    ) {
      sessionStorage.removeItem(cacheKey(label))
      return null
    }

    if (Date.now() > parsed.expiresAt) {
      sessionStorage.removeItem(cacheKey(label))
      return null
    }

    return parsed   // Return the whole cached envelope (data + page meta)
  } catch {
    // Malformed JSON or storage unavailable - treat as cache miss
    return null
  }
}

function writeCache(label, envelope) {
  try {
    sessionStorage.setItem(
      cacheKey(label),
      JSON.stringify({ ...envelope, expiresAt: Date.now() + CACHE_TTL_MS })
    )
  } catch {
    // sessionStorage quota exceeded or unavailable - silently skip
  }
}

/** Clears all TMDB cache entries. Useful for testing. */
export function clearTmdbCache() {
  try {
    const keysToRemove = []
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i)
      if (k && k.startsWith('tmdb_cache_')) keysToRemove.push(k)
    }
    keysToRemove.forEach(k => sessionStorage.removeItem(k))
    return keysToRemove.length
  } catch {
    return 0
  }
}

//  Credential Helper 

/**
 * Returns the API key string if configured, otherwise null.
 * Never logs or exposes the value — callers only receive presence/absence.
 */
function getApiKey() {
  const key = import.meta.env.VITE_TMDB_API_KEY
  return key && key.trim() ? key.trim() : null
}

export function isTmdbConfigured() {
  return getApiKey() !== null
}

//  Normaliser 

/**
 * Converts a raw TMDB item into the MovieVerse show shape.
 * Compatible with <MovieCard> and <MovieCarousel> via shared field names.
 *
 * @param {object} item      - Raw TMDB API item
 * @param {'movie'|'tv'} mediaType
 * @returns {object}         - Normalised show object
 */
export function normaliseTmdbItem(item, mediaType = 'movie') {
  if (!item || typeof item !== 'object') return null

  const isTV     = mediaType === 'tv'
  const genreMap = isTV ? TV_GENRE_MAP : MOVIE_GENRE_MAP

  // Resolve genre names from genre_ids (list endpoints) or genres[] (detail endpoints)
  let genreNames = []
  if (Array.isArray(item.genres)) {
    // Detail endpoint — genres is array of { id, name }
    genreNames = item.genres.map(g => g.name).filter(Boolean)
  } else if (Array.isArray(item.genre_ids)) {
    // List endpoint — genre_ids is array of numbers
    genreNames = item.genre_ids.map(id => genreMap[id]).filter(Boolean)
  }

  // Duration: movies have `runtime` (mins), TV has `episode_run_time` (array, mins/ep)
  let duration = 'N/A'
  if (!isTV && item.runtime) {
    duration = `${item.runtime} min`
  } else if (isTV && Array.isArray(item.episode_run_time) && item.episode_run_time[0]) {
    duration = `${item.episode_run_time[0]} min/ep`
  }

  // Age rating: TMDB uses `adult` boolean; certification requires a separate endpoint
  const ageRating = item.adult ? 'A' : 'U/A 16+'

  // Primary studio / network name
  let network = 'Unknown'
  if (Array.isArray(item.production_companies) && item.production_companies.length > 0) {
    network = item.production_companies[0].name
  } else if (Array.isArray(item.networks) && item.networks.length > 0) {
    network = item.networks[0].name
  }

  return {
    //  ID (prefixed to prevent collision with sequential local IDs "1".."52") 
    id:         `tmdb-${item.id}`,
    tmdbId:     item.id,
    mediaType,

    //  Core MovieVerse shape 
    title:       item.title || item.name || 'Unknown',
    year:        (item.release_date || item.first_air_date || '').slice(0, 4) || 'N/A',
    duration,
    ageRating,
    genres:      genreNames,
    description: item.overview || 'No description available.',

    //  Images (full CDN URLs, null-safe) 
    image:    item.poster_path   ? `${IMAGE_BASE_W500}${item.poster_path}`   : null,
    backdrop: item.backdrop_path ? `${IMAGE_BASE_W1280}${item.backdrop_path}` : null,

    //  Ratings 
    rating: typeof item.vote_average === 'number'
      ? Math.round(item.vote_average * 10) / 10
      : null,

    //  Metadata 
    language: item.original_language
      ? item.original_language.toUpperCase()
      : 'EN',
    network,
    status: item.status || (isTV ? 'N/A' : 'Released'),

    //  Source tag (distinguishes live TMDB from local fallback) 
    source: 'tmdb',
  }
}

/**
 * Normalises a TMDB credits response into the cast array shape
 * used by MovieDetailsPage (person.id, person.name, person.image, character.name).
 *
 * @param {object} creditsJson  - Raw TMDB /credits response
 * @returns {Array}
 */
export function normaliseCredits(creditsJson) {
  const cast = creditsJson?.cast
  if (!Array.isArray(cast)) return []

  return cast.slice(0, 20).map(member => ({
    person: {
      id:    member.id,
      name:  member.name || 'Unknown',
      image: {
        medium: member.profile_path
          ? `${IMAGE_BASE_W185}${member.profile_path}`
          : null,
        original: member.profile_path
          ? `${IMAGE_BASE_ORIG}${member.profile_path}`
          : null,
      },
      birthday: null,    // Requires separate /person/{id} call
      country:  'Unknown',
      gender:   member.gender === 1 ? 'Female' : member.gender === 2 ? 'Male' : 'Unknown',
    },
    character: {
      name: member.character || 'Unknown role',
    },
  }))
}

//  Shared Fetch Wrapper 

/**
 * Core fetch wrapper shared by all public API functions.
 *
 * Responsibilities:
 *  1. Validate credentials (fail fast with clear error, no network call).
 *  2. Serve from cache if still valid.
 *  3. Make authenticated HTTP request.
 *  4. Handle HTTP-level errors (4xx, 5xx).
 *  5. Handle network-level errors (offline, DNS failure).
 *  6. Handle invalid/unexpected JSON.
 *  7. Normalise items.
 *  8. Write valid responses to cache.
 *  9. Return a structured ApiResult — never throw to callers.
 *
 * @param {object} opts
 * @param {string}   opts.endpoint     - e.g. '/movie/popular'
 * @param {string}   opts.cacheLabel   - unique cache key suffix (include page for pagination)
 * @param {object}   [opts.params]     - URL query parameters (merged with language/region defaults)
 * @param {'movie'|'tv'|'auto'} [opts.mediaType]  - for normaliser
 * @param {boolean}  [opts.isDetail]   - if true, json itself is the item (not json.results)
 * @param {boolean}  [opts.isCredits]  - if true, run normaliseCredits instead
 * @returns {Promise<ApiResult>}
 */
async function tmdbFetch({
  endpoint,
  cacheLabel,
  params     = {},
  mediaType  = 'movie',
  isDetail   = false,
  isCredits  = false,
}) {
  //  1. Credential check 
  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      'TMDB API key not configured. ' +
                  'Add VITE_TMDB_API_KEY=<your_key> to the project-root .env file ' +
                  '(already covered by .gitignore).',
    }
  }

  //  2. Cache hit 
  const cached = readCache(cacheLabel)
  if (cached) {
    return {
      success:    true,
      data:       cached.data,
      source:     'cache',
      isFallback: false,
      page:       cached.page       ?? null,
      totalPages: cached.totalPages ?? null,
      error:      null,
    }
  }

  //  3. Build URL 
  const url = new URL(`${TMDB_BASE}${endpoint}`)
  // Defaults that all endpoints benefit from
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  //  4–6. Fetch + error handling 
  let json
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
    })

    if (!res.ok) {
      // Attempt to read TMDB's own error message
      let tmdbMsg = res.statusText
      try {
        const errJson = await res.json()
        if (errJson?.status_message) tmdbMsg = errJson.status_message
      } catch { /* ignore */ }

      return {
        success:    false,
        data:       [],
        source:     'error',
        isFallback: false,
        page:       null,
        totalPages: null,
        error:      `TMDB HTTP ${res.status}: ${tmdbMsg}`,
      }
    }

    json = await res.json()
  } catch (networkErr) {
    // Network failure (offline, CORS, DNS)
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      `Network error: ${networkErr?.message || 'Failed to reach TMDB'}`,
    }
  }

  //  7. Normalise 
  let normalisedData
  let page       = null
  let totalPages = null

  if (isCredits) {
    normalisedData = normaliseCredits(json)
  } else if (isDetail) {
    // Detail endpoints return a single object, not a results array
    const item = normaliseTmdbItem(json, mediaType)
    normalisedData = item ? [item] : []
  } else {
    // Detect mediaType per item for 'trending/all' which mixes movies and TV
    const rawResults = json?.results
    if (!Array.isArray(rawResults)) {
      return {
        success:    false,
        data:       [],
        source:     'error',
        isFallback: false,
        page:       null,
        totalPages: null,
        error:      'Unexpected TMDB response shape — "results" array missing.',
      }
    }
    normalisedData = rawResults
      .map(item => normaliseTmdbItem(item, mediaType === 'auto' ? (item.media_type || 'movie') : mediaType))
      .filter(Boolean)
    page       = json.page        ?? null
    totalPages = json.total_pages ?? null
  }

  //  8. Write to cache (only successful, non-empty results) 
  if (normalisedData.length > 0) {
    writeCache(cacheLabel, { data: normalisedData, page, totalPages })
  }

  //  9. Return ApiResult 
  return {
    success:    true,
    data:       normalisedData,
    source:     'tmdb',
    isFallback: false,
    page,
    totalPages,
    error:      null,
  }
}

//  Local Fallback Helper 

/**
 * Wraps localShows as a fallback ApiResult.
 * Always marked { isFallback: true, source: 'fallback' } so UI can distinguish it.
 *
 * @param {string} [reason]  - Why the fallback was triggered (for debugging)
 * @param {Array}  [subset]  - Optional slice of localShows (default: all)
 * @returns {ApiResult}
 */
export function buildFallbackResult(reason = 'TMDB unavailable', subset = null) {
  return {
    success:    true,
    data:       subset ?? localShows,
    source:     'fallback',
    isFallback: true,
    page:       1,
    totalPages: 1,
    error:      reason,   // Error message preserved so UI can optionally surface it
  }
}

//  Public API Functions 

/**
 * Fetches trending content (movies + TV) from TMDB.
 * Falls back to localShows on any failure.
 *
 * @param {'all'|'movie'|'tv'} mediaType
 * @param {'day'|'week'}       timeWindow
 * @param {number}             page  – 1-based
 * @returns {Promise<ApiResult>}
 */
export async function fetchTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
  const result = await tmdbFetch({
    endpoint:   `/trending/${mediaType}/${timeWindow}`,
    cacheLabel: `trending_${mediaType}_${timeWindow}_p${page}`,
    params:     { page },
    mediaType:  mediaType === 'all' ? 'auto' : mediaType,
  })

  if (!result.success) {
    return buildFallbackResult(result.error, localShows.slice(0, 20))
  }
  return result
}

/**
 * Fetches popular movies from TMDB.
 * Falls back to genre-filtered localShows on failure.
 *
 * @param {number} page – 1-based, up to 500
 * @returns {Promise<ApiResult>}
 */
export async function fetchPopularMovies(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/movie/popular',
    cacheLabel: `popular_movies_p${page}`,
    params:     { page },
    mediaType:  'movie',
  })

  if (!result.success) {
    const movieGenres = ['Action', 'Crime', 'Thriller', 'Adventure', 'Horror', 'Mystery']
    const fallbackMovies = localShows.filter(s => s.genres.some(g => movieGenres.includes(g)))
    return buildFallbackResult(result.error, fallbackMovies)
  }
  return result
}

/**
 * Fetches top-rated movies from TMDB.
 * Falls back to genre-filtered localShows on failure.
 *
 * @param {number} page – 1-based, up to 500
 * @returns {Promise<ApiResult>}
 */
export async function fetchTopRatedMovies(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/movie/top_rated',
    cacheLabel: `top_rated_movies_p${page}`,
    params:     { page },
    mediaType:  'movie',
  })

  if (!result.success) {
    const movieGenres = ['Action', 'Crime', 'Thriller', 'Adventure', 'Horror', 'Mystery']
    const fallbackMovies = localShows.filter(s => s.genres.some(g => movieGenres.includes(g)))
    return buildFallbackResult(result.error, fallbackMovies)
  }
  return result
}

/**
 * Fetches upcoming movies from TMDB.
 * Falls back to genre-filtered localShows on failure.
 *
 * @param {number} page – 1-based, up to 500
 * @returns {Promise<ApiResult>}
 */
export async function fetchUpcomingMovies(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/movie/upcoming',
    cacheLabel: `upcoming_movies_p${page}`,
    params:     { page },
    mediaType:  'movie',
  })

  if (!result.success) {
    const movieGenres = ['Action', 'Crime', 'Thriller', 'Adventure', 'Horror', 'Mystery']
    const fallbackMovies = localShows.filter(s => s.genres.some(g => movieGenres.includes(g)))
    return buildFallbackResult(result.error, fallbackMovies)
  }
  return result
}

/**
 * Fetches now-playing movies from TMDB.
 * Falls back to genre-filtered localShows on failure.
 *
 * @param {number} page – 1-based, up to 500
 * @returns {Promise<ApiResult>}
 */
export async function fetchNowPlayingMovies(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/movie/now_playing',
    cacheLabel: `now_playing_movies_p${page}`,
    params:     { page },
    mediaType:  'movie',
  })

  if (!result.success) {
    const movieGenres = ['Action', 'Crime', 'Thriller', 'Adventure', 'Horror', 'Mystery']
    const fallbackMovies = localShows.filter(s => s.genres.some(g => movieGenres.includes(g)))
    return buildFallbackResult(result.error, fallbackMovies)
  }
  return result
}


/**
 * Fetches popular TV shows from TMDB.
 * Falls back to localShows on failure.
 *
 * @param {number} page – 1-based
 * @returns {Promise<ApiResult>}
 */
export async function fetchPopularTvShows(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/tv/popular',
    cacheLabel: `popular_tv_p${page}`,
    params:     { page },
    mediaType:  'tv',
  })

  if (!result.success) {
    return buildFallbackResult(result.error, localShows.slice(0, 20))
  }
  return result
}

/**
 * Fetches top-rated TV shows from TMDB.
 * Falls back to localShows on failure.
 *
 * @param {number} page – 1-based
 * @returns {Promise<ApiResult>}
 */
export async function fetchTopRatedTvShows(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/tv/top_rated',
    cacheLabel: `top_rated_tv_p${page}`,
    params:     { page },
    mediaType:  'tv',
  })

  if (!result.success) {
    return buildFallbackResult(result.error, localShows.slice(0, 20))
  }
  return result
}

/**
 * Fetches TV shows airing today from TMDB.
 * Falls back to localShows on failure.
 *
 * @param {number} page – 1-based
 * @returns {Promise<ApiResult>}
 */
export async function fetchAiringTodayTvShows(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/tv/airing_today',
    cacheLabel: `airing_today_tv_p${page}`,
    params:     { page },
    mediaType:  'tv',
  })

  if (!result.success) {
    return buildFallbackResult(result.error, localShows.slice(0, 20))
  }
  return result
}

/**
 * Fetches TV shows currently on-the-air from TMDB.
 * Falls back to localShows on failure.
 *
 * @param {number} page – 1-based
 * @returns {Promise<ApiResult>}
 */
export async function fetchOnTheAirTvShows(page = 1) {
  const result = await tmdbFetch({
    endpoint:   '/tv/on_the_air',
    cacheLabel: `on_the_air_tv_p${page}`,
    params:     { page },
    mediaType:  'tv',
  })

  if (!result.success) {
    return buildFallbackResult(result.error, localShows.slice(0, 20))
  }
  return result
}

/**
 * Fetches full details for a single movie by TMDB ID.
 * Returns a single-item data array for API shape consistency.
 * No local fallback (details are ID-specific and can't be approximated).
 *
 * @param {number|string} tmdbId
 * @returns {Promise<ApiResult>}
 */
export async function fetchMovieDetails(tmdbId) {
  const id = parseInt(tmdbId, 10)
  if (!id || isNaN(id)) {
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      `Invalid TMDB ID: "${tmdbId}"`,
    }
  }

  return tmdbFetch({
    endpoint:   `/movie/${id}`,
    cacheLabel: `movie_detail_${id}`,
    params:     { append_to_response: 'release_dates' },
    mediaType:  'movie',
    isDetail:   true,
  })
}

/**
 * Fetches full details for a single TV show by TMDB ID.
 * Returns a single-item data array for API shape consistency.
 * No local fallback.
 *
 * @param {number|string} tmdbId
 * @returns {Promise<ApiResult>}
 */
export async function fetchTvDetails(tmdbId) {
  const id = parseInt(tmdbId, 10)
  if (!id || isNaN(id)) {
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      `Invalid TMDB ID: "${tmdbId}"`,
    }
  }

  return tmdbFetch({
    endpoint:   `/tv/${id}`,
    cacheLabel: `tv_detail_${id}`,
    mediaType:  'tv',
    isDetail:   true,
  })
}

/**
 * Fetches cast & crew credits for a movie by TMDB ID.
 * Returns a normalised cast array (not the usual show shape).
 * Compatible with the cast rendering in MovieDetailsPage.
 * No local fallback.
 *
 * @param {number|string} tmdbId
 * @returns {Promise<ApiResult>}  data[] is cast entries, not NormalisedShow[]
 */
export async function fetchMovieCredits(tmdbId) {
  const id = parseInt(tmdbId, 10)
  if (!id || isNaN(id)) {
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      `Invalid TMDB ID: "${tmdbId}"`,
    }
  }

  return tmdbFetch({
    endpoint:   `/movie/${id}/credits`,
    cacheLabel: `movie_credits_${id}`,
    mediaType:  'movie',
    isCredits:  true,
  })
}

/**
 * Searches TMDB for movies by title.
 * Search results are NOT cached (query-specific, low reuse value).
 * Falls back to a title-match filter against localShows on failure.
 *
 * @param {string} query
 * @param {number} page
 * @returns {Promise<ApiResult>}
 */
export async function searchMovies(query, page = 1) {
  if (!query || !query.trim()) {
    return {
      success:    true,
      data:       [],
      source:     'tmdb',
      isFallback: false,
      page:       1,
      totalPages: 0,
      error:      null,
    }
  }

  const apiKey = getApiKey()
  if (!apiKey) {
    return {
      success:    false,
      data:       [],
      source:     'error',
      isFallback: false,
      page:       null,
      totalPages: null,
      error:      'TMDB API key not configured. Add VITE_TMDB_API_KEY to .env',
    }
  }

  const url = new URL(`${TMDB_BASE}/search/multi`)
  url.searchParams.set('query',    query.trim())
  url.searchParams.set('page',     String(page))
  url.searchParams.set('language', 'en-US')
  url.searchParams.set('include_adult', 'false')

  let json
  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization:  `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
    })
    if (!res.ok) {
      throw new Error(`TMDB HTTP ${res.status}: ${res.statusText}`)
    }
    json = await res.json()
  } catch (err) {
    // Fallback: filter local shows by title
    const q = query.toLowerCase()
    const localMatches = localShows.filter(s => s.title.toLowerCase().includes(q))
    return buildFallbackResult(err.message, localMatches)
  }

  const results = (json?.results || [])
    .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
    .map(item => normaliseTmdbItem(item, item.media_type))
    .filter(Boolean)

  return {
    success:    true,
    data:       results,
    source:     'tmdb',
    isFallback: false,
    page:       json.page        ?? null,
    totalPages: json.total_pages ?? null,
    error:      null,
  }
}
