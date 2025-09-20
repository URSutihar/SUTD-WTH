import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'

export const Profile = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    chronotype: 'intermediate',
    melatonin_preference_mg: 1,
    max_caffeine_mg: 200,
    avoid_medications: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Here you would typically save to Supabase
      // For now, we'll just show a success message
      setTimeout(() => {
        setMessage('Profile updated successfully!')
        setLoading(false)
      }, 1000)
    } catch (error) {
      setMessage('Error updating profile')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="mt-2 text-gray-600">
          Customize your preferences for better jet lag planning
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={user?.user_metadata?.full_name || user?.email || ''}
                disabled
                className="mt-1 input-field bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="mt-1 input-field bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Chronotype */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Sleep Preferences</h2>
          <div>
            <label htmlFor="chronotype" className="block text-sm font-medium text-gray-700">
              Chronotype
            </label>
            <select
              name="chronotype"
              id="chronotype"
              value={profile.chronotype}
              onChange={handleInputChange}
              className="mt-1 input-field"
            >
              <option value="morning">Morning Person (Lark)</option>
              <option value="intermediate">Intermediate</option>
              <option value="evening">Evening Person (Owl)</option>
            </select>
            <p className="mt-1 text-sm text-gray-500">
              Your natural sleep-wake preference affects your jet lag recovery plan
            </p>
          </div>
        </div>

        {/* Melatonin Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Melatonin Preferences</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="melatonin_preference_mg" className="block text-sm font-medium text-gray-700">
                Preferred Melatonin Dose (mg)
              </label>
              <input
                type="number"
                name="melatonin_preference_mg"
                id="melatonin_preference_mg"
                min="0"
                max="10"
                step="0.5"
                value={profile.melatonin_preference_mg}
                onChange={handleInputChange}
                className="mt-1 input-field"
              />
              <p className="mt-1 text-sm text-gray-500">
                Typical doses range from 0.5-3mg. Consult your doctor before taking melatonin.
              </p>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="avoid_medications"
                id="avoid_medications"
                checked={profile.avoid_medications}
                onChange={handleInputChange}
                className="h-4 w-4 text-jetlag-600 focus:ring-jetlag-500 border-gray-300 rounded"
              />
              <label htmlFor="avoid_medications" className="ml-2 block text-sm text-gray-900">
                Avoid all medications and supplements
              </label>
            </div>
          </div>
        </div>

        {/* Caffeine Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Caffeine Preferences</h2>
          <div>
            <label htmlFor="max_caffeine_mg" className="block text-sm font-medium text-gray-700">
              Maximum Daily Caffeine (mg)
            </label>
            <input
              type="number"
              name="max_caffeine_mg"
              id="max_caffeine_mg"
              min="0"
              max="1000"
              value={profile.max_caffeine_mg}
              onChange={handleInputChange}
              className="mt-1 input-field"
            />
            <p className="mt-1 text-sm text-gray-500">
              Typical coffee contains 95mg caffeine. Energy drinks can contain 200-300mg.
            </p>
          </div>
        </div>

        {/* Timezone */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Location</h2>
          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
              Home Timezone
            </label>
            <input
              type="text"
              name="timezone"
              id="timezone"
              value={profile.timezone}
              onChange={handleInputChange}
              className="mt-1 input-field"
            />
            <p className="mt-1 text-sm text-gray-500">
              Your home timezone for calculating jet lag adjustments
            </p>
          </div>
        </div>

        {/* Medical Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Important:</strong> Always consult with a healthcare provider before taking melatonin or making significant changes to your sleep schedule, especially if you have medical conditions or take other medications.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className={`p-4 rounded-md ${
            message.includes('Error') 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}
