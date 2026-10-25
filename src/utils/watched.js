// Shared utility to manage watched list in localStorage across the entire project
const PRIMARY_KEY = 'movieverse_watched';
const LEGACY_KEY  = 'watched';

export function getWatched() {
  try {
    const raw = localStorage.getItem(PRIMARY_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    // Check legacy key if primary is empty
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const parsed = JSON.parse(legacyRaw);
      localStorage.setItem(PRIMARY_KEY, JSON.stringify(parsed));
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Error reading watched list from localStorage:', e);
    return [];
  }
}

export function saveWatched(list) {
  try {
    localStorage.setItem(PRIMARY_KEY, JSON.stringify(list));
    // Keep legacy key mirrored so older code/pages never break
    localStorage.setItem(LEGACY_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('watchedUpdated'));
  } catch (e) {
    console.error('Error writing watched list to localStorage:', e);
  }
}

export function addToWatched(movie, dateStr) {
  if (!movie || movie.id === undefined || movie.id === null) return;
  const list = getWatched();
  const index = list.findIndex(item => String(item.id) === String(movie.id));

  const today = new Date();
  const isoDate = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const prettyDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // 25 Oct 2026

  const movieWithDate = {
    ...movie,
    watchedDate: dateStr || movie.watchedDate || isoDate,
    watchedAt: dateStr || movie.watchedAt || prettyDate,
  };

  if (index > -1) {
    list[index] = { ...list[index], ...movieWithDate };
  } else {
    list.unshift(movieWithDate);
  }
  saveWatched(list);
}

export function removeFromWatched(movieId) {
  if (movieId === undefined || movieId === null) return;
  const list = getWatched();
  const filtered = list.filter(item => String(item.id) !== String(movieId));
  saveWatched(filtered);
}

export function toggleWatched(movie) {
  if (!movie || movie.id === undefined || movie.id === null) return false;
  if (isWatched(movie.id)) {
    removeFromWatched(movie.id);
    return false;
  } else {
    addToWatched(movie);
    return true;
  }
}

export function isWatched(movieId) {
  if (movieId === undefined || movieId === null) return false;
  const list = getWatched();
  return list.some(item => String(item.id) === String(movieId));
}

export function getWatchedDate(movieId) {
  if (movieId === undefined || movieId === null) return null;
  const list = getWatched();
  const movie = list.find(item => String(item.id) === String(movieId));
  return movie ? (movie.watchedDate || movie.watchedAt || null) : null;
}
