/**
 * verify-hero.js
 * Regression test suite for Hero stability & category-appropriate fallback selection.
 * Runs directly with Node.js (no new testing dependencies installed).
 */

import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchNowPlayingMovies,
  fetchPopularTvShows,
  fetchTopRatedTvShows,
  fetchAiringTodayTvShows,
  fetchOnTheAirTvShows,
  fetchTrending,
} from '../src/member2/services/tmdbApi.js'

let passed = 0
let failed = 0

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`)
    passed++
  } else {
    console.error(`  ✗ FAIL: ${message}`)
    failed++
  }
}

async function runTests() {
  console.log('\n--- Running Hero Regression Tests ---\n')

  // Test 1: Fallback Selection - Top Rated Movies must NOT have 'Under the Dome' as hero
  console.log('1. Testing Top Rated Movies Fallback Selection:')
  const topRated = await fetchTopRatedMovies(1)
  assert(topRated.data && topRated.data.length > 0, 'Top rated movies returned items')
  const topRatedHero = topRated.data[0]
  assert(
    topRatedHero.title !== 'Under the Dome',
    `Top rated hero is "${topRatedHero.title}" (not generic 'Under the Dome')`
  )
  assert(topRatedHero.rating >= 8.0, `Top rated hero has high rating (⭐ ${topRatedHero.rating})`)

  // Test 2: Fallback Selection - Upcoming Movies must NOT have 'Under the Dome' as hero
  console.log('\n2. Testing Upcoming Movies Fallback Selection:')
  const upcoming = await fetchUpcomingMovies(1)
  assert(upcoming.data && upcoming.data.length > 0, 'Upcoming movies returned items')
  const upcomingHero = upcoming.data[0]
  assert(
    upcomingHero.title !== 'Under the Dome',
    `Upcoming hero is "${upcomingHero.title}" (not generic 'Under the Dome')`
  )

  // Test 3: Fallback Selection - Now Playing Movies must NOT have 'Under the Dome' as hero
  console.log('\n3. Testing Now Playing Movies Fallback Selection:')
  const nowPlaying = await fetchNowPlayingMovies(1)
  assert(nowPlaying.data && nowPlaying.data.length > 0, 'Now playing movies returned items')
  const nowPlayingHero = nowPlaying.data[0]
  assert(
    nowPlayingHero.title !== 'Under the Dome',
    `Now playing hero is "${nowPlayingHero.title}" (not generic 'Under the Dome')`
  )

  // Test 4: Fallback Selection - Top Rated TV Shows
  console.log('\n4. Testing Top Rated TV Shows Fallback Selection:')
  const topRatedTv = await fetchTopRatedTvShows(1)
  assert(topRatedTv.data && topRatedTv.data.length > 0, 'Top rated TV shows returned items')
  const topRatedTvHero = topRatedTv.data[0]
  assert(
    topRatedTvHero.title !== 'Under the Dome',
    `Top rated TV hero is "${topRatedTvHero.title}" (not generic 'Under the Dome')`
  )
  assert(topRatedTvHero.rating >= 8.0, `Top rated TV hero has high rating (⭐ ${topRatedTvHero.rating})`)

  // Test 5: Fallback Selection - Airing Today TV Shows
  console.log('\n5. Testing Airing Today TV Shows Fallback Selection:')
  const airingToday = await fetchAiringTodayTvShows(1)
  assert(airingToday.data && airingToday.data.length > 0, 'Airing today TV shows returned items')
  const airingHero = airingToday.data[0]
  assert(
    airingHero.title !== 'Under the Dome',
    `Airing today hero is "${airingHero.title}" (not generic 'Under the Dome')`
  )

  // Test 6: Fallback Selection - Trending
  console.log('\n6. Testing Trending Fallback Selection:')
  const trending = await fetchTrending('movie', 'week', 1)
  assert(trending.data && trending.data.length > 0, 'Trending returned items')
  const trendingHero = trending.data[0]
  assert(
    trendingHero.title !== 'Under the Dome',
    `Trending hero is "${trendingHero.title}" (not generic 'Under the Dome')`
  )

  // Test 7: Hero Data Contract (all fallback heroes must contain valid fields to prevent empty rendering)
  console.log('\n7. Testing Hero Data Contract (No blank/pink placeholders):')
  const categories = [topRatedHero, upcomingHero, nowPlayingHero, topRatedTvHero, airingHero, trendingHero]
  categories.forEach((h, idx) => {
    assert(Boolean(h.title && (h.image || h.backdrop)), `Hero #${idx + 1} (${h.title}) has valid title and image/backdrop`)
  })

  console.log(`\n--- Test Summary: ${passed} passed, ${failed} failed ---\n`)
  if (failed > 0) {
    process.exit(1)
  }
}

runTests().catch((err) => {
  console.error('Test run error:', err)
  process.exit(1)
})
