import { useAuth } from '../contexts/AuthContext'
import { Link, useLocation, Navigate } from 'react-router-dom'

export const Layout = ({ children }) => {
  const { user, loading, signOut } = useAuth()
  const location = useLocation()

  const isLoginPage = location.pathname === '/login'

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

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome to Snorelags
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
                <h1 className="text-xl font-bold text-jetlag-600">Snorelags</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                to="/welcome"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/welcome' 
                    ? 'border-jetlag-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
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
              <Link
                to="/profile"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === '/profile' 
                    ? 'border-jetlag-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                My Profile
              </Link>
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
