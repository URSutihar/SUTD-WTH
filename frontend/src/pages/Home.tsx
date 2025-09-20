import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Plus, Clock, MapPin, Brain, Shield } from 'lucide-react'

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Beat Jet Lag with
            <span className="text-primary-600 dark:text-primary-400"> Science</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Get personalized chronobiology-based plans to help you adjust to new timezones 
            and optimize your sleep schedule. Based on the latest research in circadian rhythms.
          </p>
          
          {isAuthenticated ? (
            <Link
              to="/new-trip"
              className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Plan Your Next Trip
            </Link>
          ) : (
            <div className="space-y-4">
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-4 bg-primary-600 text-white text-lg font-semibold rounded-lg hover:bg-primary-700 transition-colors shadow-lg"
              >
                Get Started Free
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No credit card required • Works offline
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            How JetLag Coach Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Science-based approach to jet lag recovery
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Plan Your Trip
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your travel details including origin, destination, and flight times.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-accent-100 dark:bg-accent-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Brain className="w-8 h-8 text-accent-600 dark:text-accent-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              AI Analysis
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI analyzes your chronotype and creates a personalized adjustment plan.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Follow Your Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get daily reminders for light exposure, meals, and sleep timing.
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Arrive Refreshed
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Land at your destination feeling alert and ready to enjoy your trip.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white dark:bg-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose JetLag Coach?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Science-Based
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our plans are based on the latest research in chronobiology and circadian rhythm science.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Personalized
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every plan is tailored to your chronotype, sensitivity, and travel schedule.
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Easy to Follow
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Simple, actionable steps with reminders and progress tracking.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Beat Jet Lag?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of travelers who arrive refreshed and ready to explore.
          </p>
          {isAuthenticated ? (
            <Link
              to="/new-trip"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Start Planning
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-4 bg-white text-primary-600 text-lg font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Get Started Free
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
