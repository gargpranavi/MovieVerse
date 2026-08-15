import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import MoviesPage from './pages/Movies/MoviesPage.jsx'
import TvSeriesPage from './pages/TvSeries/TvSeriesPage.jsx'
import MovieDetailsPage from './pages/MovieDetails/MovieDetailsPage.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/tv-series" element={<TvSeriesPage />} />
      <Route path="/movie/:id" element={<MovieDetailsPage />} />

      {/* Placeholder routes – sidebar links land here for now */}
      <Route path="/search" element={<HomePage />} />
      <Route path="/explore" element={<HomePage />} />
      <Route path="/watchlist" element={<HomePage />} />
      <Route path="/watched" element={<HomePage />} />
      <Route path="/ratings" element={<HomePage />} />
      <Route path="/ai-recommender" element={<HomePage />} />
      <Route path="/actors" element={<HomePage />} />
      <Route path="/genres" element={<HomePage />} />
      <Route path="/directors" element={<HomePage />} />
      <Route path="/settings" element={<HomePage />} />

      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Routes>
  )
}

export default App
