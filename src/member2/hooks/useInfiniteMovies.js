/*
   MovieVerse – useInfiniteMovies.js
   Member 2 | Day 3 hook — thin wrapper around useInfiniteScroll.

   Kept for backwards-compatibility with MoviesPage.jsx.
   All pagination, deduplication, and abort logic lives in useInfiniteScroll.js.

   Returns
   ───────
   {
     movies      : NormalisedShow[]  – accumulated list (renamed from items)
     loading     : boolean
     initialLoad : boolean
     error       : string|null
     hasMore     : boolean
     isFallback  : boolean
     loadMore    : () => void
     retry       : () => void
     totalPages  : number|null
     currentPage : number
   }
*/

import { useInfiniteScroll } from './useInfiniteScroll.js'
import {
  fetchPopularMovies,
  fetchTopRatedMovies,
  fetchUpcomingMovies,
  fetchNowPlayingMovies,
} from '../services/tmdbApi.js'

const MOVIE_FETCH_MAP = {
  popular:     fetchPopularMovies,
  top_rated:   fetchTopRatedMovies,
  upcoming:    fetchUpcomingMovies,
  now_playing: fetchNowPlayingMovies,
}

/**
 * Infinite-scroll hook for the Movies page.
 *
 * @param {string} category – 'popular' | 'top_rated' | 'upcoming' | 'now_playing'
 */
export function useInfiniteMovies(category = 'popular') {
  const { items: movies, ...rest } = useInfiniteScroll(MOVIE_FETCH_MAP, category)
  return { movies, ...rest }
}
