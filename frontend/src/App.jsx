import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Layout } from './components/Layout'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Welcome } from './pages/Welcome'
import { TripLanding } from './pages/TripLanding'
import { TripPlanner } from './pages/TripPlanner'
import { TripView } from './pages/TripView'
import { TripHistory } from './pages/TripHistory'
import { ShiftWorkLanding } from './pages/ShiftWorkLanding'
import { ShiftWorkPlanView } from './pages/ShiftWorkPlanView'
import { SleepScheduleLanding } from './pages/SleepScheduleLanding'
import { SleepSchedulePlanView } from './pages/SleepSchedulePlanView'
import { Profile } from './pages/Profile'
import { Legal } from './pages/Legal'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Home />} />
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/trip/plan" element={<TripLanding />} />
              <Route path="/trip/plan-old" element={<TripPlanner />} />
              <Route path="/trip/:id" element={<TripView />} />
              <Route path="/trips" element={<TripHistory />} />
              <Route path="/schedules" element={<TripHistory />} />
              <Route path="/shift-work" element={<ShiftWorkLanding />} />
              <Route path="/shift-work/plan/:id" element={<ShiftWorkPlanView />} />
              <Route path="/sleep-schedule" element={<SleepScheduleLanding />} />
              <Route path="/sleep-schedule/plan/:id" element={<SleepSchedulePlanView />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/legal" element={<Legal />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
