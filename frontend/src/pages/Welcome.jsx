import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export const Welcome = () => {
  const { user } = useAuth()

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Main Content Area */}
      <div className="flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        {/* Welcome Text */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            Hello, how are you feeling today?
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Choose what you'd like to work on
          </p>
        </div>

        {/* Three Selection Buttons */}
        <div className="w-full max-w-md space-y-3 sm:space-y-4">
          <Link
            to="/trip/plan"
            className="block w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300 min-h-[80px] sm:min-h-[100px]"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 h-full">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Going on a trip</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Plan your travel and beat jet lag</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/shift-work"
            className="block w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300 min-h-[80px] sm:min-h-[100px]"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 h-full">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Going to/coming from shift work</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Adjust your schedule for work shifts</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          <Link
            to="/sleep-schedule"
            className="block w-full bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-200 hover:border-jetlag-300 min-h-[80px] sm:min-h-[100px]"
          >
            <div className="flex items-center space-x-3 sm:space-x-4 h-full">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-jetlag-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-jetlag-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-medium text-gray-900">Fix my sleep schedule (other reasons)</h3>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Reset and optimize your sleep routine</p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
