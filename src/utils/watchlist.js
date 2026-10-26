// Shared utility to manage watchlist in localStorage across the entire project
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
    // Dispatch a custom event so all components update in real time
    window.dispatchEvent(new Event('watchlistUpdated'));
  } catch (e) {
    console.error('Error writing watchlist to localStorage:', e);
  }
}

export function addToWatchlist(movie) {
  if (!movie || movie.id === undefined || movie.id === null) return;
  const list = getWatchlist();
  const exists = list.some(item => String(item.id) === String(movie.id));
  if (!exists) {
    list.push(movie);
    saveWatchlist(list);
  }
}

export function removeFromWatchlist(movieId) {
  if (movieId === undefined || movieId === null) return;
  const list = getWatchlist();
  const filtered = list.filter(item => String(item.id) !== String(movieId));
  saveWatchlist(filtered);
}

export function toggleWatchlist(movie) {
  if (!movie || movie.id === undefined || movie.id === null) return false;
  const list = getWatchlist();
  const index = list.findIndex(item => String(item.id) === String(movie.id));
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(movie);
  }
  saveWatchlist(list);
  return index === -1; // returns true if added, false if removed
}

export function isInWatchlist(movieId) {
  if (movieId === undefined || movieId === null) return false;
  const list = getWatchlist();
  return list.some(item => String(item.id) === String(movieId));
}
