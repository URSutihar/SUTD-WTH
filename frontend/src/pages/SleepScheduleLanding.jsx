import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { HourMinuteSelect } from '../components/HourMinuteSelect'

export const SleepScheduleLanding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    currentSleepSchedule: {
      bedtime: '',
      waketime: '',
      sleepDuration: ''
    },
    desiredSleepSchedule: {
      bedtime: '',
      waketime: '',
      sleepDuration: ''
    },
    sleepIssues: {
      difficultyFallingAsleep: false,
      difficultyStayingAsleep: false,
      earlyMorningAwakening: false,
      irregularSchedule: false,
      jetLag: false,
      shiftWork: false
    },
    preferences: {
      chronotype: 'intermediate', // early, intermediate, late
      lightSensitivity: 'medium', // low, medium, high
      caffeineIntake: 'moderate' // none, light, moderate, heavy
    }
  })

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const calculateSleepDuration = (bedtime, waketime) => {
    if (!bedtime || !waketime) return ''
    
    const bedTime = new Date(`2000-01-01T${bedtime}`)
    const wakeTime = new Date(`2000-01-01T${waketime}`)
    
    // Handle overnight sleep (wake time next day)
    if (wakeTime <= bedTime) {
      wakeTime.setDate(wakeTime.getDate() + 1)
    }
    
    const durationMs = wakeTime - bedTime
    const durationHours = Math.floor(durationMs / (1000 * 60 * 60))
    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
    
    return `${durationHours}h ${durationMinutes}m`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Prepare sleep schedule data for plan generation
      const sleepScheduleData = {
        user_id: user.id, // Include user ID to prevent UUID error
        current_schedule: formData.currentSleepSchedule,
        desired_schedule: formData.desiredSleepSchedule,
        sleep_issues: formData.sleepIssues,
        preferences: formData.preferences
      }

      // Generate the sleep schedule plan
      const response = await apiClient.generateSleepSchedulePlan(sleepScheduleData)
      console.log('Sleep schedule plan response:', response) // Debug log
      
      // Navigate to the generated plan
      navigate(`/sleep-schedule/plan/${response.id}`)
      
    } catch (err) {
      console.error('Sleep schedule plan generation error:', err)
      
      // Handle different types of error responses
      let errorMessage = 'Failed to generate sleep schedule plan'
      
      if (err.message) {
        errorMessage = err.message
      } else if (Array.isArray(err)) {
        errorMessage = err.map(e => e.message || e.toString()).join(', ')
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = JSON.stringify(err)
      } else {
        errorMessage = err.toString()
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            Reset Your Sleep Schedule
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Tell us about your current sleep patterns and desired schedule to get a personalized plan for fixing your sleep routine.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Current Sleep Schedule Section */}
            <div className="border-b border-gray-200 pb-4 sm:pb-8">
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-jetlag-600 mr-2 sm:mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sm sm:text-base">1. Current Sleep Schedule</span>
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="currentBedtime" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Current Bedtime
                  </label>
                  <HourMinuteSelect
                    name="currentBedtime"
                    id="currentBedtime"
                    value={formData.currentSleepSchedule.bedtime}
                    onChange={(e) => {
                      handleInputChange('currentSleepSchedule', 'bedtime', e.target.value)
                      const duration = calculateSleepDuration(e.target.value, formData.currentSleepSchedule.waketime)
                      handleInputChange('currentSleepSchedule', 'sleepDuration', duration)
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="currentWaketime" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Wake Time
                  </label>
                  <HourMinuteSelect
                    name="currentWaketime"
                    id="currentWaketime"
                    value={formData.currentSleepSchedule.waketime}
                    onChange={(e) => {
                      handleInputChange('currentSleepSchedule', 'waketime', e.target.value)
                      const duration = calculateSleepDuration(formData.currentSleepSchedule.bedtime, e.target.value)
                      handleInputChange('currentSleepSchedule', 'sleepDuration', duration)
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Duration
                  </label>
                  <div className="input-field bg-gray-50 text-gray-600">
                    {formData.currentSleepSchedule.sleepDuration || 'Auto-calculated'}
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Enter your current bedtime and wake time to establish your baseline sleep pattern.
              </p>
            </div>

            {/* Desired Sleep Schedule Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-jetlag-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                2. Desired Sleep Schedule
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="desiredBedtime" className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Bedtime
                  </label>
                  <HourMinuteSelect
                    name="desiredBedtime"
                    id="desiredBedtime"
                    value={formData.desiredSleepSchedule.bedtime}
                    onChange={(e) => {
                      handleInputChange('desiredSleepSchedule', 'bedtime', e.target.value)
                      const duration = calculateSleepDuration(e.target.value, formData.desiredSleepSchedule.waketime)
                      handleInputChange('desiredSleepSchedule', 'sleepDuration', duration)
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="desiredWaketime" className="block text-sm font-medium text-gray-700 mb-2">
                    Desired Wake Time
                  </label>
                  <HourMinuteSelect
                    name="desiredWaketime"
                    id="desiredWaketime"
                    value={formData.desiredSleepSchedule.waketime}
                    onChange={(e) => {
                      handleInputChange('desiredSleepSchedule', 'waketime', e.target.value)
                      const duration = calculateSleepDuration(formData.desiredSleepSchedule.bedtime, e.target.value)
                      handleInputChange('desiredSleepSchedule', 'sleepDuration', duration)
                    }}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sleep Duration
                  </label>
                  <div className="input-field bg-gray-50 text-gray-600">
                    {formData.desiredSleepSchedule.sleepDuration || 'Auto-calculated'}
                  </div>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Enter your ideal bedtime and wake time for your optimal sleep schedule.
              </p>
            </div>

            {/* Sleep Issues Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-jetlag-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                3. Sleep Issues (Optional)
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(formData.sleepIssues).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleInputChange('sleepIssues', key, e.target.checked)}
                      className="h-4 w-4 text-jetlag-600 focus:ring-jetlag-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </span>
                  </label>
                ))}
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Select any sleep issues you're experiencing to get more targeted recommendations.
              </p>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-jetlag-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                4. Personal Preferences (Optional)
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="chronotype" className="block text-sm font-medium text-gray-700 mb-2">
                    Chronotype
                  </label>
                  <select
                    id="chronotype"
                    value={formData.preferences.chronotype}
                    onChange={(e) => handleInputChange('preferences', 'chronotype', e.target.value)}
                    className="input-field"
                  >
                    <option value="early">Early Bird</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="late">Night Owl</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="lightSensitivity" className="block text-sm font-medium text-gray-700 mb-2">
                    Light Sensitivity
                  </label>
                  <select
                    id="lightSensitivity"
                    value={formData.preferences.lightSensitivity}
                    onChange={(e) => handleInputChange('preferences', 'lightSensitivity', e.target.value)}
                    className="input-field"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="caffeineIntake" className="block text-sm font-medium text-gray-700 mb-2">
                    Caffeine Intake
                  </label>
                  <select
                    id="caffeineIntake"
                    value={formData.preferences.caffeineIntake}
                    onChange={(e) => handleInputChange('preferences', 'caffeineIntake', e.target.value)}
                    className="input-field"
                  >
                    <option value="none">None</option>
                    <option value="light">Light</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Optional: Help us personalize your sleep schedule recommendations.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error creating plan
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Generate Plan Button */}
        <div className="flex justify-center pt-6 sm:pt-8">
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.currentSleepSchedule.bedtime || !formData.desiredSleepSchedule.bedtime}
            className="inline-flex items-center px-6 sm:px-8 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 min-h-[44px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="text-sm sm:text-base">Generating Plan...</span>
              </>
            ) : (
              <>
                <span className="text-sm sm:text-base">Generate My Sleep Schedule Plan</span>
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
    </div>
  )
}
