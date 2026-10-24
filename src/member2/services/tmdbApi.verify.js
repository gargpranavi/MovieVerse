
const m = await import('/src/member2/services/tmdbApi.js')

let passed = 0, failed = 0

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`%c✅ PASS%c  ${label}`, 'color:green;font-weight:bold', 'color:inherit')
    passed++
  } else {
    console.warn(`%c❌ FAIL%c  ${label}${detail ? '\n       ' + detail : ''}`, 'color:red;font-weight:bold', 'color:inherit')
    failed++
  }
}

console.group('%c MovieVerse – tmdbApi Day 1 Verification', 'font-size:14px;font-weight:bold;color:#D4A017')
console.log('Running', Object.keys(m).length, 'exports:', Object.keys(m).join(', '))
console.log('')


// 1. MODULE EXPORTS

console.group('1. Module Exports')

const requiredExports = [
  'fetchTrending', 'fetchPopularMovies', 'fetchPopularTvShows',
  'fetchMovieDetails', 'fetchTvDetails', 'fetchMovieCredits', 'searchMovies',
  'normaliseTmdbItem', 'normaliseCredits', 'buildFallbackResult',
  'isTmdbConfigured', 'clearTmdbCache',
  'MOVIE_GENRE_MAP', 'TV_GENRE_MAP', 'TMDB_IMAGE_SIZES',
]
requiredExports.forEach(name => check(`exports ${name}`, typeof m[name] !== 'undefined'))

console.groupEnd()
console.log('')


// 2. CREDENTIAL DETECTION

console.group('2. Credential Detection')

const isConfigured = m.isTmdbConfigured()
if (isConfigured) {
  console.log('%c  TMDB API key is present (value hidden)', 'color:#888')
} else {
  console.log('%c  TMDB API key is NOT set — fallback tests will run', 'color:#f59e0b')
}
check('isTmdbConfigured() returns a boolean', typeof isConfigured === 'boolean')

console.groupEnd()
console.log('')

// 3. NORMALISERTMDBITEM

console.group('3. normaliseTmdbItem — shape validation')

const fakeMovie = {
  id:           12345,
  title:        'Test Movie',
  overview:     'A test.',
  release_date: '2024-07-04',
  genre_ids:    [28, 878],      // Action, Science-Fiction
  poster_path:  '/abc.jpg',
  backdrop_path: '/def.jpg',
  vote_average: 7.85,
  original_language: 'en',
  adult:        false,
  runtime:      null,
}

const norm = m.normaliseTmdbItem(fakeMovie, 'movie')
check('id is prefixed "tmdb-12345"',           norm?.id === 'tmdb-12345')
check('tmdbId is raw number',                  norm?.tmdbId === 12345)
check('title matches',                         norm?.title === 'Test Movie')
check('year extracted from release_date',      norm?.year === '2024')
check('genres resolved from genre_ids',        Array.isArray(norm?.genres) && norm.genres.includes('Action'))
check('image is full CDN URL (w500)',          norm?.image === 'https://image.tmdb.org/t/p/w500/abc.jpg')
check('backdrop is full CDN URL (w1280)',      norm?.backdrop === 'https://image.tmdb.org/t/p/w1280/def.jpg')
check('rating rounded to 1dp',                norm?.rating === 7.9)
check('source is "tmdb"',                     norm?.source === 'tmdb')
check('mediaType is "movie"',                 norm?.mediaType === 'movie')
check('null-safe for missing poster_path',    m.normaliseTmdbItem({ id: 1 }, 'movie')?.image === null)
check('null-safe for null item',              m.normaliseTmdbItem(null) === null)

// TV normalisation
const fakeTV = {
  id:              9876,
  name:            'Test Show',
  overview:        'A TV test.',
  first_air_date:  '2021-03-15',
  genre_ids:       [18, 9648],   // Drama, Mystery
  poster_path:     '/tv.jpg',
  vote_average:    8.2,
  original_language: 'ko',
}
const normTV = m.normaliseTmdbItem(fakeTV, 'tv')
check('TV: title from .name field',           normTV?.title === 'Test Show')
check('TV: year from first_air_date',         normTV?.year === '2021')
check('TV: genres from TV_GENRE_MAP',         normTV?.genres.includes('Drama'))
check('TV: mediaType is "tv"',                normTV?.mediaType === 'tv')

console.groupEnd()
console.log('')

// 4. normaliseCredits

console.group('4. normaliseCredits — shape validation')

const fakeCredits = {
  cast: [
    { id: 1, name: 'Actor One', character: 'Hero', profile_path: '/p1.jpg', gender: 2 },
    { id: 2, name: 'Actor Two', character: 'Villain', profile_path: null, gender: 1 },
  ]
}
const credits = m.normaliseCredits(fakeCredits)
check('returns an array',                           Array.isArray(credits))
check('person.id present',                          credits[0]?.person?.id === 1)
check('person.name present',                        credits[0]?.person?.name === 'Actor One')
check('person.image.medium is CDN URL',             credits[0]?.person?.image?.medium?.includes('image.tmdb.org'))
check('character.name present',                     credits[0]?.character?.name === 'Hero')
check('gender mapping Male',                        credits[0]?.person?.gender === 'Male')
check('gender mapping Female',                      credits[1]?.person?.gender === 'Female')
check('null profile_path → null image',             credits[1]?.person?.image?.medium === null)
check('empty cast returns []',                      m.normaliseCredits({ cast: [] }).length === 0)
check('null input returns []',                      m.normaliseCredits(null).length === 0)

console.groupEnd()
console.log('')


// 5. buildFallbackResult

console.group('5. buildFallbackResult — shape and flags')

const fb = m.buildFallbackResult('network error', [{ id: '1', title: 'Local' }])
check('success is true',        fb.success === true)
check('isFallback is true',     fb.isFallback === true)
check('source is "fallback"',   fb.source === 'fallback')
check('error message preserved', fb.error === 'network error')
check('data contains item',     fb.data[0]?.title === 'Local')

// Default subset = all local shows
const fbDefault = m.buildFallbackResult()
check('default uses full localShows', Array.isArray(fbDefault.data) && fbDefault.data.length > 0)

console.groupEnd()
console.log('')


// 6. SESSION CACHE — write, read, expiry

console.group('6. Session Cache behaviour')

// Clear first
m.clearTmdbCache()

// Make a real call (will either hit TMDB or return fallback/error)
const cacheTest = await m.fetchPopularMovies(1)
check('call returns an object with success field', typeof cacheTest.success === 'boolean')
check('call returns data array',                  Array.isArray(cacheTest.data))

if (isConfigured) {
  // Second call should be served from cache
  const cacheTest2 = await m.fetchPopularMovies(1)
  check('second call served from cache (source="cache")', cacheTest2.source === 'cache')

  // Different page must not return same cache
  const page2 = await m.fetchPopularMovies(2)
  check('page 2 fetches fresh (not page 1 cache)',
    page2.source !== 'cache' || page2.data[0]?.id !== cacheTest.data[0]?.id
  )
} else {
  console.log('%c  Skipping live cache tests — no API key configured', 'color:#888')
}

// Verify clearTmdbCache removes entries
const cleared = m.clearTmdbCache()
if (isConfigured) {
  check('clearTmdbCache removes entries', cleared > 0)
} else {
  check('clearTmdbCache runs without error', typeof cleared === 'number')
}

console.groupEnd()
console.log('')


// 7. ERROR / MISSING CREDENTIAL BEHAVIOUR

console.group('7. Error & Fallback behaviour')

if (!isConfigured) {
  const r = await m.fetchTrending()
  check('missing key → success=true (fallback)',  r.success === true)
  check('missing key → isFallback=true',          r.isFallback === true)
  check('missing key → source="fallback"',        r.source === 'fallback')
  check('missing key → error string set',         typeof r.error === 'string' && r.error.length > 0)
  check('missing key → data[] is non-empty local data', r.data.length > 0)
} else {
  // Test invalid ID
  const inv = await m.fetchMovieDetails('not-a-number')
  check('invalid ID → success=false',   inv.success === false)
  check('invalid ID → descriptive error', inv.error.includes('Invalid TMDB ID'))
  console.log('%c  (No-key fallback path tested — API key is present)', 'color:#888')
}

// Empty search query
const emptySearch = await m.searchMovies('')
check('empty search → data=[] success=true', emptySearch.success === true && emptySearch.data.length === 0)

console.groupEnd()
console.log('')


// 8. GENRE MAPS

console.group('8. Genre maps')
check('MOVIE_GENRE_MAP[28] = "Action"',           m.MOVIE_GENRE_MAP[28]  === 'Action')
check('MOVIE_GENRE_MAP[878] = "Science-Fiction"', m.MOVIE_GENRE_MAP[878] === 'Science-Fiction')
check('TV_GENRE_MAP[18] = "Drama"',               m.TV_GENRE_MAP[18]     === 'Drama')
check('TV_GENRE_MAP[10765] = "Science-Fiction"',  m.TV_GENRE_MAP[10765]  === 'Science-Fiction')
console.groupEnd()
console.log('')

 
// SUMMARY
 
const total = passed + failed
console.log(
  `%c RESULTS: ${passed}/${total} passed, ${failed} failed`,
  `font-size:14px;font-weight:bold;color:${failed === 0 ? '#22c55e' : '#ef4444'}`
)
if (!isConfigured) {
  console.log('%c ⚠ Live TMDB tests skipped — add VITE_TMDB_API_KEY to .env and restart Vite', 'color:#f59e0b')
}
console.groupEnd()
