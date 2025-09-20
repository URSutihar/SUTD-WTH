import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation, Navigate } from 'react-router-dom'

export const Layout = ({ children }) => {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'
  const isWelcomePage = location.pathname === '/welcome'

  // Redirect authenticated users from home to welcome page
  if (user && location.pathname === '/') {
    return <Navigate to="/welcome" replace />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jetlag-600"></div>
      </div>
    )
  }

  if (isLoginPage || isWelcomePage) {
    return <>{children}</>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Jetlag Planner
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please sign in to continue
            </p>
          </div>
          <div className="mt-8">
            <Link
              to="/login"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jetlag-500"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-jetlag-600">Jetlag Planner</h1>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/' 
                      ? 'border-jetlag-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Home
                </Link>
                <Link
                  to="/trip/plan"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/trip/plan' 
                      ? 'border-jetlag-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Plan Trip
                </Link>
                <Link
                  to="/trips"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname === '/trips' || location.pathname === '/schedules'
                      ? 'border-jetlag-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  My Schedules
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
