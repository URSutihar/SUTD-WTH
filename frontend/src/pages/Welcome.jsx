import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Welcome = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Bar with App Name/Logo */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-jetlag-600">Jetlag Planner</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Welcome Text */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-2">
            Hello, how are you feeling today?
          </h2>
          <p className="text-lg text-gray-600">
            Choose what you'd like to work on
          </p>
        </div>

        {/* Three Selection Buttons */}
        <div className="w-full max-w-md space-y-4">
          <Link
            to="/trip/plan"
            className="block w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Going on a trip</h3>
                <p className="text-sm text-gray-500">Plan your travel and beat jet lag</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/shift-work"
            className="block w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">Going for shift work</h3>
                <p className="text-sm text-gray-500">Adjust your schedule for work shifts</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/sleep-schedule"
            className="block w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">I want to fix my sleep schedule</h3>
                <p className="text-sm text-gray-500">Reset and optimize your sleep routine</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                to="/schedule/new"
                className="flex items-center space-x-2 text-gray-600 hover:text-jetlag-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium">New Schedule</span>
              </Link>
              
              <Link
                to="/schedules"
                className="flex items-center space-x-2 text-gray-600 hover:text-jetlag-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium">My Schedules</span>
              </Link>
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-600 hover:text-jetlag-600 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
