import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import AuthPage from './pages/AuthPage'
import ExplorePage from './pages/ExplorePage'
import CountryDetailPage from './pages/CountryDetailPage'

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/explore" replace />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/country/:code" element={<CountryDetailPage />} />
      </Route>

      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? '/explore' : '/auth'} replace />
        }
      />
    </Routes>
  )
}

export default App
