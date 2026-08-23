/* =============================================
   MovieVerse – animeApi.js
   Member 2 | Jikan v4 API Service

   Base URL : https://api.jikan.moe/v4
   No API key required.

   Caching   : sessionStorage, 5-minute TTL
   Fallback  : On any error, caller should use animeData.js

   All functions return normalised objects that match
   the MovieVerse show shape:
   {
     id, title, year, duration, ageRating,
     genres[], description, image, rating,
     language, network, status,
     // anime extras:
     episodes, type, malId, trailer, studios[]
   }
   ============================================= */

const BASE = 'https://api.jikan.moe/v4'
const CACHE_TTL_MS = 5 * 60 * 1000   // 5 minutes

// ── Genre IDs on MyAnimeList ──────────────────
export const GENRE_IDS = {
  Action:    1,
  Romance:   22,
  Fantasy:   10,
  Comedy:    4,
  Adventure: 2,
  SciFi:     24,
  Horror:    14,
  Mystery:   7,
  Drama:     8,
  Thriller:  41,
}

/* ═══════════════════════════════════════════════
   Cache helpers  (sessionStorage-based)
   ═══════════════════════════════════════════════ */

function cacheKey(key) {
  return `anime_cache_${key}`
}

function readCache(key) {
  try {
    const raw = sessionStorage.getItem(cacheKey(key))
    if (!raw) return null
    const { data, expiresAt } = JSON.parse(raw)
    if (Date.now() > expiresAt) {
      sessionStorage.removeItem(cacheKey(key))
      return null
    }
    return data
  } catch {
    return null
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      cacheKey(key),
      JSON.stringify({ data, expiresAt: Date.now() + CACHE_TTL_MS })
    )
  } catch {
    // sessionStorage quota exceeded — ignore
  }
}

/* ═══════════════════════════════════════════════
   Data normaliser
   Converts a Jikan anime item → MovieVerse shape
   ═══════════════════════════════════════════════ */

export function normaliseAnime(item) {
  if (!item) return null

  const genres = (item.genres || []).map(g => g.name).filter(Boolean)
  const studios = (item.studios || []).map(s => s.name).filter(Boolean)

  // Prefer large image, fall back to regular
  const image =
    item.images?.jpg?.large_image_url ||
    item.images?.jpg?.image_url ||
    item.images?.webp?.large_image_url ||
    null

  // Build a hero banner — Jikan doesn't provide wide banners,
  // so we use the trailer thumbnail if available, else the poster
  const banner =
    item.trailer?.images?.maximum_image_url ||
    item.trailer?.images?.large_image_url ||
    image

  return {
    // Core shape (matches MovieVerse shows.js)
    id:          String(item.mal_id),
    title:       item.title_english || item.title || 'Unknown Anime',
    year:        item.year ? String(item.year) : (item.aired?.prop?.from?.year ? String(item.aired.prop.from.year) : 'N/A'),
    duration:    item.duration ? item.duration.replace(' per ep', '/ep') : 'N/A',
    ageRating:   item.rating ? item.rating.split(' ')[0] : 'PG-13',
    genres,
    description: item.synopsis || 'No description available.',
    image,
    rating:      item.score || null,
    language:    'Japanese',
    network:     studios[0] || 'Unknown Studio',
    status:      item.status || 'N/A',

    // Anime-specific extras
    episodes:    item.episodes || null,
    type:        item.type || 'TV',
    malId:       item.mal_id,
    banner,
    trailerUrl:  item.trailer?.url || null,
    studios,
    source:      item.source || null,
    titleJP:     item.title || null,
  }
}

/* ═══════════════════════════════════════════════
   Core fetch wrapper
   ─ handles HTTP errors
   ─ reads/writes cache
   ═══════════════════════════════════════════════ */

async function apiFetch(endpoint, cacheLabel) {
  // Try cache first
  const cached = readCache(cacheLabel)
  if (cached) return cached

  const url = `${BASE}${endpoint}`
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`Jikan ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()

  // Jikan wraps data in { data: [...] }
  const raw = json.data || []
  const normalised = Array.isArray(raw)
    ? raw.map(normaliseAnime).filter(Boolean)
    : normaliseAnime(raw)

  writeCache(cacheLabel, normalised)
  return normalised
}

/* ═══════════════════════════════════════════════
   Public API functions
   ═══════════════════════════════════════════════ */

/** Top anime (by rank) */
export async function fetchTopAnime(limit = 20) {
  return apiFetch(`/top/anime?limit=${limit}`, 'top_anime')
}

/** Currently airing anime */
export async function fetchAiringAnime(limit = 20) {
  return apiFetch(`/seasons/now?limit=${limit}`, 'airing_anime')
}

/** Anime movies */
export async function fetchAnimeMovies(limit = 20) {
  return apiFetch(`/anime?type=movie&order_by=score&sort=desc&limit=${limit}`, 'anime_movies')
}

/** Anime by genre ID */
export async function fetchAnimeByGenre(genreId, limit = 20) {
  return apiFetch(
    `/anime?genres=${genreId}&order_by=score&sort=desc&limit=${limit}`,
    `genre_${genreId}`
  )
}

/** Search anime by title */
export async function searchAnime(query, limit = 12) {
  if (!query || !query.trim()) return []
  const encoded = encodeURIComponent(query.trim())
  // Don't cache search results — they're query-specific and small
  const url = `${BASE}/anime?q=${encoded}&limit=${limit}&sfw=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Jikan search ${res.status}`)
  const json = await res.json()
  return (json.data || []).map(normaliseAnime).filter(Boolean)
}

/** Single anime full detail (by MAL id) */
export async function fetchAnimeById(malId) {
  const cacheLabel = `anime_${malId}`
  const cached = readCache(cacheLabel)
  if (cached) return cached

  const res = await fetch(`${BASE}/anime/${malId}/full`)
  if (!res.ok) throw new Error(`Jikan ${res.status}`)
  const json = await res.json()
  const normalised = normaliseAnime(json.data)
  writeCache(cacheLabel, normalised)
  return normalised
}

/** Characters for a single anime */
export async function fetchAnimeCharacters(malId) {
  const cacheLabel = `chars_${malId}`
  const cached = readCache(cacheLabel)
  if (cached) return cached

  const res = await fetch(`${BASE}/anime/${malId}/characters`)
  if (!res.ok) return []
  const json = await res.json()

  const chars = (json.data || []).slice(0, 12).map(entry => ({
    id:        entry.character?.mal_id,
    name:      entry.character?.name || 'Unknown',
    image:     entry.character?.images?.jpg?.image_url || null,
    role:      entry.role || 'Supporting',
    voiceActor: entry.voice_actors?.[0]?.person?.name || null,
  }))

  writeCache(cacheLabel, chars)
  return chars
}

/** Recommendations for a single anime */
export async function fetchAnimeRecommendations(malId) {
  const cacheLabel = `recs_${malId}`
  const cached = readCache(cacheLabel)
  if (cached) return cached

  const res = await fetch(`${BASE}/anime/${malId}/recommendations`)
  if (!res.ok) return []
  const json = await res.json()

  const recs = (json.data || []).slice(0, 8).map(entry => {
    const e = entry.entry
    if (!e) return null
    return {
      id:    String(e.mal_id),
      title: e.title || 'Unknown',
      image: e.images?.jpg?.large_image_url || e.images?.jpg?.image_url || null,
      malId: e.mal_id,
    }
  }).filter(Boolean)

  writeCache(cacheLabel, recs)
  return recs
}
