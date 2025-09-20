import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TripProvider } from './context/TripContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import NewTrip from './pages/NewTrip'
import TripView from './pages/TripView'
import History from './pages/History'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import ProtectedRoute from './components/Auth/ProtectedRoute'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TripProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/new-trip" element={
                <ProtectedRoute>
                  <NewTrip />
                </ProtectedRoute>
              } />
              <Route path="/trip/:tripId" element={
                <ProtectedRoute>
                  <TripView />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </TripProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
