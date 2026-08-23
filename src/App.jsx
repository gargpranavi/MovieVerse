import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './member2/pages/LoginPage.jsx'
import WatchlistPage2 from './member2/pages/WatchlistPage2.jsx'
import WatchedPage2 from './member2/pages/WatchedPage2.jsx'
import ProfilePage from './member2/pages/ProfilePage.jsx'
import AnimePage from './member2/pages/AnimePage.jsx'
import AnimeDetailsPage from './member2/pages/AnimeDetailsPage.jsx'

import HomePage from './pages/Home/HomePage.jsx'
import MoviesPage from './pages/Movies/MoviesPage.jsx'
import TvSeriesPage from './pages/TvSeries/TvSeriesPage.jsx'
import MovieDetailsPage from './pages/MovieDetails/MovieDetailsPage.jsx'
import AiFeaturesPage from './pages/AiFeatures/AiFeaturesPage.jsx'

function App() {
  return (
    <Routes>
      {/* Default → Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />

      {/* Movie Discovery */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/tv-series" element={<TvSeriesPage />} />
      <Route path="/movie/:id" element={<MovieDetailsPage />} />
      <Route path="/ai-features" element={<AiFeaturesPage />} />

      {/* Member 2 – Watchlist, Watched & Anime */}
      <Route path="/watchlist" element={<WatchlistPage2 />} />
      <Route path="/watched" element={<WatchedPage2 />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/anime" element={<AnimePage />} />
      <Route path="/anime/:id" element={<AnimeDetailsPage />} />

      {/* Placeholder routes */}
      <Route path="/search" element={<HomePage />} />
      <Route path="/explore" element={<HomePage />} />
      <Route path="/ratings" element={<HomePage />} />
      <Route path="/ai-recommender" element={<HomePage />} />
      <Route path="/actors" element={<HomePage />} />
      <Route path="/genres" element={<HomePage />} />
      <Route path="/directors" element={<HomePage />} />
      <Route path="/settings" element={<HomePage />} />
    </Routes>
  )
}

export default App