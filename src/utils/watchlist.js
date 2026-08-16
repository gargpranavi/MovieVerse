// Simple utility to manage watchlist in local storage to prevent git conflicts with friends working on pages
export function getWatchlist() {
  try {
    const list = localStorage.getItem('watchlist');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error('Error reading watchlist from localStorage:', e);
    return [];
  }
}

export function saveWatchlist(list) {
  try {
    localStorage.setItem('watchlist', JSON.stringify(list));
    // Dispatch a custom event to notify other components of the change instantly
    window.dispatchEvent(new Event('watchlistUpdated'));
  } catch (e) {
    console.error('Error writing watchlist to localStorage:', e);
  }
}

export function toggleWatchlist(movie) {
  const list = getWatchlist();
  const index = list.findIndex(item => item.id === movie.id);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(movie);
  }
  saveWatchlist(list);
  return index === -1; // returns true if added, false if removed
}

export function isInWatchlist(movieId) {
  const list = getWatchlist();
  return list.some(item => item.id === movieId);
}
