import React from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Calendar, Clock, Globe } from 'lucide-react'

const Profile: React.FC = () => {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Loading profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Your account information and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="card">
          <div className="card-content">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  {user.email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Preferences
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              These settings help us create better plans for you
            </p>
          </div>
          
          <div className="card-content">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Chronotype
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {user.chronotype} person
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Timezone
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.timezone}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Jet Lag Sensitivity
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                    {user.sensitivity} sensitivity
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Account
            </h3>
          </div>
          
          <div className="card-content">
            <div className="space-y-4">
              <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Export Data
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Download a copy of your trip data and preferences
                </p>
              </button>
              
              <button className="w-full text-left p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Privacy Settings
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Manage your privacy and data sharing preferences
                </p>
              </button>
              
              <button className="w-full text-left p-4 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <h4 className="font-medium text-red-600 dark:text-red-400">
                  Delete Account
                </h4>
                <p className="text-sm text-red-500 dark:text-red-400">
                  Permanently delete your account and all data
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
