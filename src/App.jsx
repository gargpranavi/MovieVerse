import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage.jsx'

function App() {
  return (
    <Routes>
      {/* Default → Login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />

      {/* More routes will be added by each member here */}
      {/* <Route path="/home"     element={<HomePage />} /> */}
      {/* <Route path="/register" element={<RegisterPage />} /> */}
    </Routes>
  )
}

export default App
