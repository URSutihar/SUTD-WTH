import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { HourMinuteSelect } from '../components/HourMinuteSelect'

export const ShiftWorkLanding = () => {
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
    shiftDetails: {
      shiftType: 'day', // day, night, rotating
      workStartTime: '',
      workEndTime: '',
      workDays: [] // array of days
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
      // Prepare shift work data for plan generation
      const shiftWorkData = {
        user_id: user.id, // Include user ID to prevent UUID error
        current_schedule: formData.currentSleepSchedule,
        desired_schedule: formData.desiredSleepSchedule,
        shift_details: formData.shiftDetails,
        preferences: {
          max_caffeine_mg: 200,
          melatonin_preference_mg: 1,
          avoid_medications: false
        }
      }

      // Generate the shift work plan
      const response = await apiClient.generateShiftWorkPlan(shiftWorkData)
      console.log('Shift work plan response:', response) // Debug log
      
      // Navigate to the generated plan
      navigate(`/shift-work/plan/${response.id}`)
      
    } catch (err) {
      console.error('Shift work plan generation error:', err)
      console.error('Error type:', typeof err)
      console.error('Error constructor:', err.constructor.name)
      console.error('Error keys:', Object.keys(err))
      
      // Handle different types of error responses
      let errorMessage = 'Failed to generate shift work plan'
      
      if (err.message) {
        errorMessage = err.message
      } else if (Array.isArray(err)) {
        errorMessage = err.map(e => {
          if (typeof e === 'object' && e !== null) {
            return JSON.stringify(e)
          }
          return e.toString()
        }).join(', ')
      } else if (typeof err === 'object' && err !== null) {
        // Try to extract meaningful information from the error object
        if (err.detail) {
          errorMessage = err.detail
        } else if (err.error) {
          errorMessage = err.error
        } else if (err.errors) {
          errorMessage = Array.isArray(err.errors) ? err.errors.join(', ') : err.errors
        } else {
          errorMessage = JSON.stringify(err)
        }
      } else {
        errorMessage = String(err)
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Working On Shifts? Fix Your Sleep Now
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your current and desired sleep schedule to get personalized recommendations for shift work adaptation.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Current Sleep Schedule Section */}
            <div className="border-b border-gray-200 pb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-jetlag-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                1. Current Sleep Schedule
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="currentBedtime" className="block text-sm font-medium text-gray-700 mb-2">
                    Bedtime
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
                    Wake Time
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
                Enter your typical bedtime and wake time when you're not working shifts.
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
                Enter your ideal bedtime and wake time for your shift work schedule.
              </p>
            </div>

            {/* Shift Details Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-6 h-6 text-jetlag-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                3. Shift Details (Optional)
              </h3>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label htmlFor="shiftType" className="block text-sm font-medium text-gray-700 mb-2">
                    Shift Type
                  </label>
                  <select
                    id="shiftType"
                    value={formData.shiftDetails.shiftType}
                    onChange={(e) => handleInputChange('shiftDetails', 'shiftType', e.target.value)}
                    className="input-field"
                  >
                    <option value="day">Day Shift</option>
                    <option value="night">Night Shift</option>
                    <option value="rotating">Rotating Shifts</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="workStartTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Start Time
                  </label>
                  <HourMinuteSelect
                    name="workStartTime"
                    id="workStartTime"
                    value={formData.shiftDetails.workStartTime}
                    onChange={(e) => handleInputChange('shiftDetails', 'workStartTime', e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="workEndTime" className="block text-sm font-medium text-gray-700 mb-2">
                    Work End Time
                  </label>
                  <HourMinuteSelect
                    name="workEndTime"
                    id="workEndTime"
                    value={formData.shiftDetails.workEndTime}
                    onChange={(e) => handleInputChange('shiftDetails', 'workEndTime', e.target.value)}
                  />
                </div>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Optional: Provide your work schedule details for more personalized recommendations.
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
        <div className="flex justify-center pt-8">
          <button
            onClick={handleSubmit}
            disabled={loading || !formData.currentSleepSchedule.bedtime || !formData.desiredSleepSchedule.bedtime}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Plan...
              </>
            ) : (
              <>
                Generate My Shift Work Plan
                <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </div>
    </div>
  )
}
