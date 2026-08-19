// Utility to manage user ratings and reviews in localStorage
export function getReviews() {
  try {
    const data = localStorage.getItem('reviews');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading reviews from localStorage:', e);
    return {};
  }
}

export function saveReviews(reviews) {
  try {
    localStorage.setItem('reviews', JSON.stringify(reviews));
    window.dispatchEvent(new Event('reviewsUpdated'));
  } catch (e) {
    console.error('Error writing reviews to localStorage:', e);
  }
}

export function saveUserRating(movieId, rating) {
  const reviews = getReviews();
  if (!reviews[movieId]) {
    reviews[movieId] = { rating: 0, reviewText: '', reviewDate: '' };
  }
  reviews[movieId].rating = rating;
  saveReviews(reviews);
}

export function saveUserReview(movieId, reviewText, movieTitle) {
  const reviews = getReviews();
  if (!reviews[movieId]) {
    reviews[movieId] = { rating: 0, reviewText: '', reviewDate: '' };
  }
  reviews[movieId].reviewText = reviewText;
  reviews[movieId].movieTitle = movieTitle;
  reviews[movieId].reviewDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  saveReviews(reviews);
}

export function getUserRating(movieId) {
  const reviews = getReviews();
  return reviews[movieId] ? reviews[movieId].rating : 0;
}

export function getUserReview(movieId) {
  const reviews = getReviews();
  return reviews[movieId] ? reviews[movieId] : null;
}
