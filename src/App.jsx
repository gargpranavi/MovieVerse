import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage      from './member2/pages/LoginPage.jsx'
import WatchlistPage2 from './member2/pages/WatchlistPage2.jsx'

function App() {
  return (
    <Routes>
      {/* Default → Login */}
      <Route path="/"          element={<Navigate to="/login" replace />} />
      <Route path="/login"     element={<LoginPage />} />

      {/* Member 2 – Watchlist & User Activity */}
      <Route path="/watchlist" element={<WatchlistPage2 />} />

      {/* More routes will be added by each member here */}
      {/* <Route path="/home"     element={<HomePage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
      {/* <Route path="/watched"  element={<WatchedPage2 />} /> */}
      {/* <Route path="/profile"  element={<ProfilePage2 />} /> */}
    </Routes>
  )
}

export default App
