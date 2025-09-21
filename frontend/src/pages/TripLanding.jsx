import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { CityAutocomplete } from '../components/CityAutocomplete'
import { HourMinuteSelect } from '../components/HourMinuteSelect'
import { getTimezoneFromCity, calculateFlightDuration } from '../utils/tripUtils'

export const TripLanding = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputMethod, setInputMethod] = useState('route') // 'route' or 'flight'
  const [flightNumber, setFlightNumber] = useState('')
  const [flightDate, setFlightDate] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editPlanId, setEditPlanId] = useState(null)
  const [formData, setFormData] = useState({
    origin: '',
    originTimezone: '',
    destination: '',
    destinationTimezone: '',
    departureDate: '',
    departureTime: '',
    arrivalDate: '',
    arrivalTime: '',
    airline: '',
    flightNumber: '',
    seatClass: 'economy'
  })

  useEffect(() => {
    // Check if we're in edit mode
    if (location.state?.editMode && location.state?.planData) {
      setEditMode(true)
      setEditPlanId(location.state.planId)
      
      // Pre-fill form with existing trip data
      const tripData = location.state.planData
      const departureDate = new Date(tripData.departure_utc)
      const arrivalDate = new Date(tripData.arrival_utc)
      
      setFormData({
        origin: tripData.origin || '',
        originTimezone: tripData.origin_timezone || '',
        destination: tripData.destination || '',
        destinationTimezone: tripData.destination_timezone || '',
        departureDate: departureDate.toISOString().split('T')[0],
        departureTime: departureDate.toTimeString().slice(0, 5),
        arrivalDate: arrivalDate.toISOString().split('T')[0],
        arrivalTime: arrivalDate.toTimeString().slice(0, 5),
        airline: '',
        flightNumber: '',
        seatClass: 'economy'
      })
    }
  }, [location.state])

  const handleFlightLookup = async () => {
    if (!flightNumber.trim()) {
      setError('Please enter a flight number')
      return
    }

    setLookupLoading(true)
    setError(null)

    try {
      const flightInfo = await apiClient.lookupFlight(flightNumber, flightDate || null)
      
      // Parse the flight data and populate the form
      const departureTime = flightInfo.departure.scheduled ? 
        new Date(flightInfo.departure.scheduled) : null
      const arrivalTime = flightInfo.arrival.scheduled ? 
        new Date(flightInfo.arrival.scheduled) : null

      setFormData(prev => ({
        ...prev,
        origin: flightInfo.departure.airport || '',
        originTimezone: flightInfo.departure.timezone || '',
        destination: flightInfo.arrival.airport || '',
        destinationTimezone: flightInfo.arrival.timezone || '',
        departureDate: departureTime ? departureTime.toISOString().split('T')[0] : '',
        departureTime: departureTime ? departureTime.toTimeString().slice(0, 5) : '',
        arrivalDate: arrivalTime ? arrivalTime.toISOString().split('T')[0] : '',
        arrivalTime: arrivalTime ? arrivalTime.toTimeString().slice(0, 5) : '',
        airline: flightInfo.airline || '',
        flightNumber: flightInfo.flight_number || flightNumber,
        // Calculate flight duration if both times are available
        flightDuration: departureTime && arrivalTime ? 
          Math.round((arrivalTime - departureTime) / (1000 * 60)) : ''
      }))

      // Switch to route method to show the populated form
      setInputMethod('route')
      
    } catch (err) {
      console.error('Flight lookup error:', err)
      
      // Provide more helpful error message for missing API key
      if (err.message.includes('AviationStack API key not configured')) {
        setError('Flight lookup is not available. Please enter your trip details manually using the "Enter Route Details" option.')
      } else if (err.message.includes('subscription plan does not support')) {
        setError('Flight lookup is not available with your current AviationStack subscription plan. Please enter your trip details manually using the "Enter Route Details" option.')
      } else {
        setError(`Failed to lookup flight: ${err.message}`)
      }
    } finally {
      setLookupLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCityChange = (field, cityName) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: cityName }
      
      // Auto-detect timezone from city name
      const timezone = getTimezoneFromCity(cityName)
      if (timezone) {
        const timezoneField = field === 'origin' ? 'originTimezone' : 'destinationTimezone'
        newData[timezoneField] = timezone
      }
      
      return newData
    })
  }


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert local times to UTC - use simple approach for now
      const departureUTC = new Date(`${formData.departureDate}T${formData.departureTime}:00`).toISOString()
      const arrivalUTC = new Date(`${formData.arrivalDate}T${formData.arrivalTime}:00`).toISOString()

      // Calculate flight duration automatically
      const calculatedDuration = calculateFlightDuration(
        formData.departureDate,
        formData.departureTime,
        formData.arrivalDate,
        formData.arrivalTime,
        formData.originTimezone,
        formData.destinationTimezone
      )

      const tripData = {
        user: {
          id: user.id,
          email: user.email,
          chronotype: 'intermediate', // This should come from user profile
          sleep_baseline: {
            bedtime: '23:30',
            waketime: '07:30',
            typical_duration_minutes: 480
          }
        },
        trip: {
          user_id: user.id,
          origin: formData.origin,
          origin_timezone: formData.originTimezone,
          destination: formData.destination,
          destination_timezone: formData.destinationTimezone,
          departure_utc: departureUTC,
          arrival_utc: arrivalUTC,
          flight_duration_minutes: calculatedDuration || 0,
          airline: formData.airline,
          flight_number: formData.flightNumber,
          seat_class: formData.seatClass
        },
        preferences: {
          max_caffeine_mg: 200,
          melatonin_preference_mg: 1,
          avoid_medications: false
        }
      }

      if (editMode && editPlanId) {
        // Update existing trip
        await apiClient.updateTrip(editPlanId, tripData.trip)
        // Navigate back to the updated trip
        navigate(`/trip/${editPlanId}`)
      } else {
        // Create new trip
        const response = await apiClient.generatePlan(tripData)
        // Navigate to the trip using the trip_id from the response
        navigate(`/trip/${response.trip_id}`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
            {editMode ? 'Edit Your Trip Plan' : 'Beat Jet Lag for Your Upcoming Trip'}
          </h2>
          {editMode && (
            <p className="mb-3 sm:mb-4 text-sm text-gray-600 px-4">
              Update your trip details below. Changes will overwrite your existing plan.
            </p>
          )}
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Enter your flight details and get a personalized circadian plan to prevent or minimize jet lag.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-8">
          {/* Input Method Selection */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-8">
              <button
                type="button"
                onClick={() => setInputMethod('route')}
                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center ${
                  inputMethod === 'route'
                    ? 'bg-jetlag-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm sm:text-base">Route Information</span>
              </button>
              
              <div className="text-gray-400 font-medium text-sm sm:text-base">OR</div>
              
              <button
                type="button"
                onClick={() => setInputMethod('flight')}
                className={`w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200 min-h-[44px] flex items-center justify-center ${
                  inputMethod === 'flight'
                    ? 'bg-jetlag-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span className="text-sm sm:text-base">Enter Flight Number</span>
              </button>
            </div>
          </div>

          {/* Flight Number Lookup */}
          {inputMethod === 'flight' && (
            <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Flight Number Lookup
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Enter your flight number to automatically fill in trip details. <strong>Note:</strong> Flight lookup requires a paid AviationStack subscription. If unavailable, you can enter your details manually using the "Enter Route Details" option below.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="flightNumberInput" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    id="flightNumberInput"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="mt-1 input-field min-h-[44px]"
                    placeholder="e.g., SQ12, AA123"
                  />
                </div>
                <div>
                  <label htmlFor="flightDateInput" className="block text-xs sm:text-sm font-medium text-gray-700">
                    Flight Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="flightDateInput"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="mt-1 input-field min-h-[44px]"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleFlightLookup}
                    disabled={lookupLoading || !flightNumber.trim()}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
                  >
                    {lookupLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span className="text-sm sm:text-base">Looking up...</span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-base">Lookup Flight</span>
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-gray-500">
                Enter your flight number (e.g., SQ12, AA123) and we'll automatically fetch the flight details.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Route Information Form - Only show when route method is selected */}
            {inputMethod === 'route' && (
              <>
                {/* Route Information Section */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-jetlag-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Route Information
                  </h3>
                  
                  {/* Origin */}
                  <div className="mb-4 sm:mb-6">
                    <label htmlFor="origin" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Origin City
                    </label>
                    <CityAutocomplete
                      id="origin"
                      value={formData.origin}
                      onChange={(cityName) => handleCityChange('origin', cityName)}
                      placeholder="e.g., Singapore"
                      required
                    />
                  </div>

                  {/* Destination */}
                  <div>
                    <label htmlFor="destination" className="block text-xs sm:text-sm font-medium text-gray-700">
                      Destination City
                    </label>
                    <CityAutocomplete
                      id="destination"
                      value={formData.destination}
                      onChange={(cityName) => handleCityChange('destination', cityName)}
                      placeholder="e.g., Los Angeles"
                      required
                    />
                  </div>
                </div>

                {/* Schedule Information Section */}
                <div className="border-b border-gray-200 pb-4 sm:pb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-jetlag-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Schedule Information
                  </h3>
                  
                  {/* Departure */}
                  <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 mb-4 sm:mb-6">
                    <div>
                      <label htmlFor="departureDate" className="block text-xs sm:text-sm font-medium text-gray-700">
                        Departure Date
                      </label>
                      <input
                        type="date"
                        name="departureDate"
                        id="departureDate"
                        required
                        value={formData.departureDate}
                        onChange={handleInputChange}
                        className="mt-1 input-field min-h-[44px]"
                      />
                    </div>
                    <div>
                      <label htmlFor="departureTime" className="block text-xs sm:text-sm font-medium text-gray-700">
                        Departure Time (Local)
                      </label>
                      <HourMinuteSelect
                        name="departureTime"
                        id="departureTime"
                        value={formData.departureTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                    <div>
                      <label htmlFor="arrivalDate" className="block text-sm font-medium text-gray-700">
                        Arrival Date
                      </label>
                      <input
                        type="date"
                        name="arrivalDate"
                        id="arrivalDate"
                        required
                        value={formData.arrivalDate}
                        onChange={handleInputChange}
                        className="mt-1 input-field"
                      />
                    </div>
                    <div>
                      <label htmlFor="arrivalTime" className="block text-sm font-medium text-gray-700">
                        Arrival Time (Local)
                      </label>
                      <HourMinuteSelect
                        name="arrivalTime"
                        id="arrivalTime"
                        value={formData.arrivalTime}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                </div>

              </>
            )}

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

        {/* Generate Plan Button - Separate from form */}
        <div className="flex justify-center pt-6 sm:pt-8">
          {(inputMethod === 'route' || (inputMethod === 'flight' && formData.origin && formData.destination)) && (
            <button
              onClick={handleSubmit}
              disabled={loading}
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
                  <span className="text-sm sm:text-base">
                    {editMode ? 'Update My Trip Plan' : 'Generate My Jet Lag Plan'}
                  </span>
                  <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
    </div>
  )
}
