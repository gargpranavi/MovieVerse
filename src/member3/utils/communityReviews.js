/*
  communityReviews.js — Member 3
  Separate from the existing reviews.js (which handles single-user ratings).
  This utility manages a LIST of community reviews per movie,
  stored in localStorage under 'movieverse_community_reviews'.
  Namespaced to avoid collision with existing 'reviews' key.
*/

const STORAGE_KEY = 'movieverse_community_reviews'

/** Load all community reviews from localStorage. Returns an object keyed by movieId. */
export function getCommunityReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch (e) {
    console.error('Error reading community reviews:', e)
    return {}
  }
}

/** Get the array of community reviews for a specific movie. */
export function getReviewsForMovie(movieId) {
  const all = getCommunityReviews()
  return Array.isArray(all[movieId]) ? all[movieId] : []
}

/** Save a new community review for a movie. Returns the updated reviews array. */
export function addCommunityReview(movieId, { name, rating, text }) {
  const all = getCommunityReviews()
  if (!Array.isArray(all[movieId])) {
    all[movieId] = []
  }

  const newReview = {
    id: Date.now().toString(), // unique id based on timestamp
    name: name.trim(),
    rating,
    text: text.trim(),
    date: new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  }

  all[movieId] = [newReview, ...all[movieId]] // newest first

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.error('Error saving community review:', e)
  }

  return all[movieId]
}
