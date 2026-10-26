/*
  MovieVerse – src/member2/index.js
  Central barrel export for Member 2 modules
*/

// Components
export { default as AnimeCard }         from './components/AnimeCard/AnimeCard.jsx'
export { default as AnimeCarousel }     from './components/AnimeCarousel/AnimeCarousel.jsx'
export { default as EmptyState2 }       from './components/EmptyState2/EmptyState2.jsx'
export { default as MovieSkeletonCard } from './components/MovieSkeletonCard/MovieSkeletonCard.jsx'
export { default as ProfileCard }       from './components/ProfileCard/ProfileCard.jsx'
export { default as ProtectedRoute }    from './components/ProtectedRoute/ProtectedRoute.jsx'
export { default as Rating, getMovieRating } from './components/Rating/Rating.jsx'
export { default as ReviewCard }        from './components/ReviewCard/ReviewCard.jsx'
export { default as StatusBadge2 }      from './components/StatusBadge2/StatusBadge2.jsx'
export { default as WatchlistCard2 }    from './components/WatchlistCard2/WatchlistCard2.jsx'

// Pages
export { default as AnimeDetailsPage }  from './pages/AnimeDetailsPage/AnimeDetailsPage.jsx'
export { default as AnimePage }         from './pages/AnimePage/AnimePage.jsx'
export { default as LoginPage }         from './pages/LoginPage/LoginPage.jsx'
export { default as ProfilePage }       from './pages/ProfilePage/ProfilePage.jsx'
export { default as WatchedPage2 }      from './pages/WatchedPage2/WatchedPage2.jsx'
export { default as WatchlistPage2 }    from './pages/WatchlistPage2/WatchlistPage2.jsx'

// Context & Hooks
export { AuthContext, AuthProvider }    from './context/AuthContext.jsx'
export { useAuth }                      from './hooks/useAuth.js'
export { useAuthContext }               from './hooks/useAuthContext.js'
export { useTmdb }                      from './hooks/useTmdb.js'
export { useInfiniteMovies }            from './hooks/useInfiniteMovies.js'
export { useInfiniteScroll }            from './hooks/useInfiniteScroll.js'

// Services
export * from './services/tmdbApi.js'
export * from './services/localAuth.js'
export * from './services/animeApi.js'
