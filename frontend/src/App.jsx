import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { TripPlanner } from './pages/TripPlanner'
import { TripView } from './pages/TripView'
import { TripHistory } from './pages/TripHistory'
import { Profile } from './pages/Profile'
import { Legal } from './pages/Legal'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/trip/plan" element={<TripPlanner />} />
            <Route path="/trip/:id" element={<TripView />} />
            <Route path="/trips" element={<TripHistory />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/legal" element={<Legal />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  )
}

export default App
