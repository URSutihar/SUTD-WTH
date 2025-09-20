import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { pushService } from '../services/push'
import { Bell, Moon, Sun, Monitor, Check, X } from 'lucide-react'

const Settings: React.FC = () => {
  const { user, updateUser } = useAuth()
  const { theme, setTheme, actualTheme } = useTheme()
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false)

  const handleNotificationToggle = async () => {
    setIsUpdatingNotifications(true)
    
    try {
      if (notificationsEnabled) {
        await pushService.unsubscribe()
        setNotificationsEnabled(false)
      } else {
        const subscription = await pushService.subscribe()
        setNotificationsEnabled(!!subscription)
      }
    } catch (error) {
      console.error('Failed to update notifications:', error)
    } finally {
      setIsUpdatingNotifications(false)
    }
  }

  const handleChronotypeChange = (chronotype: 'morning' | 'evening' | 'neutral') => {
    updateUser({ chronotype })
  }

  const handleSensitivityChange = (sensitivity: 'low' | 'medium' | 'high') => {
    updateUser({ sensitivity })
  }

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'light':
        return <Sun className="w-4 h-4" />
      case 'dark':
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Customize your JetLag Coach experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Profile
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Your personal information and preferences
            </p>
          </div>
          
          <div className="card-content space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                disabled
                className="input w-full bg-gray-50 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input w-full bg-gray-50 dark:bg-gray-700"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Chronotype
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['morning', 'evening', 'neutral'] as const).map((chronotype) => (
                  <button
                    key={chronotype}
                    onClick={() => handleChronotypeChange(chronotype)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      user?.chronotype === chronotype
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium capitalize">{chronotype}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {chronotype === 'morning' && 'Early riser'}
                      {chronotype === 'evening' && 'Night owl'}
                      {chronotype === 'neutral' && 'Flexible'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Jet Lag Sensitivity
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['low', 'medium', 'high'] as const).map((sensitivity) => (
                  <button
                    key={sensitivity}
                    onClick={() => handleSensitivityChange(sensitivity)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      user?.sensitivity === sensitivity
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium capitalize">{sensitivity}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {sensitivity === 'low' && 'Quick recovery'}
                      {sensitivity === 'medium' && 'Moderate impact'}
                      {sensitivity === 'high' && 'Strong effects'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Notifications
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your reminder preferences
            </p>
          </div>
          
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    Push Notifications
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Get reminders for your scheduled activities
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleNotificationToggle}
                disabled={isUpdatingNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Appearance
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Customize the look and feel of the app
            </p>
          </div>
          
          <div className="card-content">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Theme
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['light', 'dark', 'system'] as const).map((themeName) => (
                  <button
                    key={themeName}
                    onClick={() => setTheme(themeName)}
                    className={`p-3 rounded-lg border text-center transition-colors ${
                      theme === themeName
                        ? 'border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                        : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-center mb-2">
                      {getThemeIcon(themeName)}
                    </div>
                    <div className="font-medium capitalize">{themeName}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              About
            </h2>
          </div>
          
          <div className="card-content">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  JetLag Coach
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Version 1.0.0
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                  Medical Disclaimer
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  This app provides general guidance, not medical advice. Consult a healthcare 
                  professional before using melatonin or making significant changes to sleep 
                  or medication routines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
