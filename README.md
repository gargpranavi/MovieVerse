# 🎬 MovieVerse – Final Project Summary

This document summarizes the contributions and feature ownership across the 3-member team for the MovieVerse project.

---

## 👤 Member 1
**Branch/Focus:** `feature/movie-discovery`
**Core Responsibilities:** Architecture, Core Routing, and Movie Discovery

*   **Application Core:** Setup the React Router foundation (`App.jsx`), global styling (`index.css`), and the main `DashboardLayout`.
*   **Discovery Pages:** Built the primary `HomePage`, `MoviesPage`, and `TvSeriesPage`.
*   **Movie Details:** Implemented the `MovieDetailsPage` to showcase full metadata, casting, and trailers for movies.
*   **UI Components:** Created the highly reusable `MovieCard`, `MovieCarousel`, and `VideoPlayerModal` components.
*   **Navigation:** Designed and implemented the `TopNavbar` and the responsive sidebar navigation.
*   **Data:** Normalised the main `shows.js` dataset that powers the core application.

---

## 👤 Member 2 (My Work)
**Branch/Focus:** `feature/user-watchlist` & Anime Integration & TMDB Infinite Scroll
**Core Responsibilities:** User Features, Data Persistence, Anime Hub, TMDB API & Infinite Scrolling

*   **TMDB API Service (Day 1):** Built `tmdbApi.js` — a full REST API service with response normalisation, sessionStorage caching (5-min TTL), 3-layer error handling, and automatic local-data fallback.
*   **Auth System (Day 2):** Built a production-quality auth layer using Supabase — cinematic `LoginPage` with email/password, Google OAuth, forgot-password flow; `useAuth` hook; `AuthContext` provider; `ProtectedRoute` guard; `ProfilePage` reads live Supabase user data.
*   **Infinite Scroll Movies (Day 3):** Replaced the static Movies page with a live TMDB infinite-scroll grid. Uses `IntersectionObserver` with a sentinel element, a 3-layer duplicate-prevention system (`loadingRef` + `fetchedPages` Set + `seenIds` Set), `AbortController` request cancellation, shimmer skeleton loaders, category tabs (Popular / Top Rated / Now Playing / Upcoming), per-page error + Retry, and an end-of-results indicator.
*   **Anime Ecosystem:** Built the complete `/anime` and `/anime/:id` experience (`AnimePage`, `AnimeDetailsPage`), ensuring it matches the premium aesthetic of the main app.
*   **Anime Data & Fallback:** Created `animeData.js` (a robust local dataset) and `animeApi.js` to ensure the Anime section works flawlessly even without an API connection.
*   **State & Persistence:** Built the utility functions (`utils/watchlist.js`, `utils/watched.js`, `utils/likes.js`, `utils/reviews.js`) that use `localStorage` and custom window events to sync user interactions across the app in real-time.
*   **UI Components:** Designed `AnimeCard`, `AnimeCarousel`, `Rating`, `WatchlistCard`, `ProfileCard`, and robust empty states.
*   **Global Search:** Upgraded the `TopNavbar` search functionality to query both movies and anime simultaneously and route correctly.

---

## 👤 Member 3
**Branch/Focus:** `feature/trending-exploration` & External Pages
**Core Responsibilities:** Static Integrations, AI Features, and External Hubs

*   **Static Pages:** Built the standalone vanilla HTML/JS hubs including `movies3.html`, `drama3.html`, and `kids3.html` located in the `public/pages/` directory.
*   **External Navbar:** Created `Navbar3.jsx` (and its Babel compilation setup) to ensure navigation parity between the static HTML pages and the React application.
*   **AI Integration:** Developed the `AiFeaturesPage` for advanced AI-driven recommendations and chat features.
*   **Data Handling:** Managed the `movies3.js` and other static datasets used exclusively by the external pages.
