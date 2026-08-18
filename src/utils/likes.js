// Utility to manage liked movies in localStorage

export function getLikes() {
  try {
    const list = localStorage.getItem('filmoria_likes');
    return list ? JSON.parse(list) : [];
  } catch (e) {
    console.error('Error reading likes from localStorage:', e);
    return [];
  }
}

export function saveLikes(list) {
  try {
    localStorage.setItem('filmoria_likes', JSON.stringify(list));
    // Notify all components listening for changes
    window.dispatchEvent(new Event('likesUpdated'));
  } catch (e) {
    console.error('Error writing likes to localStorage:', e);
  }
}

export function toggleLike(movie) {
  const list = getLikes();
  const index = list.findIndex(item => item.id === movie.id);
  if (index > -1) {
    list.splice(index, 1);
  } else {
    list.push(movie);
  }
  saveLikes(list);
  return index === -1; // true = liked, false = unliked
}

export function isLiked(movieId) {
  const list = getLikes();
  return list.some(item => item.id === movieId);
}
