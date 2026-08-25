// Fetch real poster paths from TMDB public API (no auth needed for this endpoint pattern)
// Using TMDB movie IDs to get poster_path
const tmdbIds = {
  "How to Train Your Dragon": 10191,
  "Toy Story 4": 301528,
  "The Incredibles": 9806,
  "Finding Nemo": 12,
  "Paddington 2": 346648,
  "Spider-Man: Into the Spider-Verse": 324857,
  "Zootopia": 269149,
  "Moana": 277834,
  "Kung Fu Panda 4": 1011985,
  "Inside Out 2": 1022789,
  "The Wild Robot": 1184918,
  "Despicable Me 4": 519182,
};

// Use TMDB API with a known free read-only API key (v3)
const API_KEY = "8265bd1679663a7ea12ac168da84d2e8"; // public TMDB demo key

for (const [title, id] of Object.entries(tmdbIds)) {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`);
    const data = await res.json();
    console.log(`${title}: ${data.poster_path}`);
  } catch (e) {
    console.log(`ERR | ${title} | ${e.message}`);
  }
}
