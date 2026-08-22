// Utility to manage watched list in localStorage
export function getWatched() {
  try {
    const list = localStorage.getItem('watched');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error('Error reading watched list from localStorage:', e);
    return [];
  }
}

export function saveWatched(list) {
  try {
    localStorage.setItem('watched', JSON.stringify(list));
    window.dispatchEvent(new Event('watchedUpdated'));
  } catch (e) {
    console.error('Error writing watched list to localStorage:', e);
  }
}

export function addToWatched(movie, dateStr) {
  const list = getWatched();
  const index = list.findIndex(item => item.id === movie.id);
  
  const movieWithDate = {
    ...movie,
    watchedAt: dateStr || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  };

  if (index > -1) {
    list[index] = movieWithDate;
  } else {
    list.push(movieWithDate);
  }
  saveWatched(list);
}

export function removeFromWatched(movieId) {
  const list = getWatched();
  const filtered = list.filter(item => item.id !== movieId);
  saveWatched(filtered);
}

export function isWatched(movieId) {
  const list = getWatched();
  return list.some(item => item.id === movieId);
}

export function getWatchedDate(movieId) {
  const list = getWatched();
  const movie = list.find(item => item.id === movieId);
  return movie ? movie.watchedAt : null;
}
