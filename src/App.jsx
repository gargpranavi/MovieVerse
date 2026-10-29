import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from './member2/pages/LoginPage/LoginPage.jsx'
import WatchlistPage2 from './member2/pages/WatchlistPage2/WatchlistPage2.jsx'
import WatchedPage2 from './member2/pages/WatchedPage2/WatchedPage2.jsx'
import ProfilePage from './member2/pages/ProfilePage/ProfilePage.jsx'
import AnimePage from './member2/pages/AnimePage/AnimePage.jsx'
import AnimeDetailsPage from './member2/pages/AnimeDetailsPage/AnimeDetailsPage.jsx'
import ProtectedRoute from './member2/components/ProtectedRoute/ProtectedRoute.jsx'

import HomePage from './pages/Home/HomePage.jsx'
import MoviesPage from './pages/Movies/MoviesPage.jsx'
import TvSeriesPage from './pages/TvSeries/TvSeriesPage.jsx'
import MovieDetailsPage from './pages/MovieDetails/MovieDetailsPage.jsx'
import AiFeaturesPage from './pages/AiFeatures/AiFeaturesPage.jsx'

function App() {
  return (
    <Routes>
      {/* Default → Home (ProtectedRoute guards and redirects to /login if needed) */}
      <Route path="/" element={<Navigate to="/home" replace />} />

      {/* Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/auth/callback" element={<Navigate to="/home" replace />} />

      {/* ── Protected: Movie Discovery ── */}
      <Route path="/home" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/movies" element={
        <ProtectedRoute><MoviesPage /></ProtectedRoute>
      } />
      <Route path="/tv-series" element={
        <ProtectedRoute><TvSeriesPage /></ProtectedRoute>
      } />
      <Route path="/movie/:id" element={
        <MovieDetailsPage />
      } />
      <Route path="/ai-features" element={
        <ProtectedRoute><AiFeaturesPage /></ProtectedRoute>
      } />

      {/* ── Protected: Member 2 – Watchlist, Watched & Anime ── */}
      <Route path="/watchlist" element={
        <ProtectedRoute><WatchlistPage2 /></ProtectedRoute>
      } />
      <Route path="/watched" element={
        <ProtectedRoute><WatchedPage2 /></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><ProfilePage /></ProtectedRoute>
      } />
      <Route path="/anime" element={
        <ProtectedRoute><AnimePage /></ProtectedRoute>
      } />
      <Route path="/anime/:id" element={
        <ProtectedRoute><AnimeDetailsPage /></ProtectedRoute>
      } />

      {/* ── Protected: Placeholder routes ── */}
      <Route path="/search" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/explore" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/ratings" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/ai-recommender" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/actors" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/genres" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/directors" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><HomePage /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default App