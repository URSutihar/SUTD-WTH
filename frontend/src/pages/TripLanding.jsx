import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { timezones } from '../utils/timezones'

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
    flightDuration: '',
    layovers: [],
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
        flightDuration: tripData.flight_duration_minutes ? Math.floor(tripData.flight_duration_minutes / 60) : '',
        layovers: tripData.layovers || [],
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
      setError(`Failed to lookup flight: ${err.message}`)
    } finally {
      setLookupLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const addLayover = () => {
    setFormData(prev => ({
      ...prev,
      layovers: [...prev.layovers, { 
        airport: '', 
        arrivalTime: '', 
        departureTime: '',
        duration: ''
      }]
    }))
  }

  const updateLayover = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      layovers: prev.layovers.map((layover, i) => 
        i === index ? { ...layover, [field]: value } : layover
      )
    }))
  }

  const removeLayover = (index) => {
    setFormData(prev => ({
      ...prev,
      layovers: prev.layovers.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Convert local times to UTC
      const departureUTC = new Date(`${formData.departureDate}T${formData.departureTime}`).toISOString()
      const arrivalUTC = new Date(`${formData.arrivalDate}T${formData.arrivalTime}`).toISOString()

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
          flight_duration_minutes: parseInt(formData.flightDuration),
          layovers: formData.layovers.map(layover => ({
            airport: layover.airport,
            arrival_utc: new Date(`${formData.departureDate}T${layover.arrivalTime}`).toISOString(),
            departure_utc: new Date(`${formData.departureDate}T${layover.departureTime}`).toISOString(),
            duration_minutes: parseInt(layover.duration) || 0
          })),
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/welcome" className="flex items-center space-x-2 text-gray-600 hover:text-jetlag-600">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-bold text-jetlag-600">Trip Planning</h1>
            <div></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {editMode ? 'Edit Your Trip Plan' : 'Plan Your Trip & Beat Jet Lag'}
          </h2>
          {editMode && (
            <p className="mb-4 text-sm text-gray-600">
              Update your trip details below. Changes will overwrite your existing plan.
            </p>
          )}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enter your flight details and get a personalized circadian plan to prevent or minimize jet lag.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Input Method Selection */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              <button
                type="button"
                onClick={() => setInputMethod('route')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  inputMethod === 'route'
                    ? 'bg-jetlag-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Route Information
              </button>
              
              <div className="text-gray-400 font-medium">OR</div>
              
              <button
                type="button"
                onClick={() => setInputMethod('flight')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  inputMethod === 'flight'
                    ? 'bg-jetlag-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enter Flight Number
              </button>
            </div>
          </div>

          {/* Flight Number Lookup */}
          {inputMethod === 'flight' && (
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Flight Number Lookup
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="flightNumberInput" className="block text-sm font-medium text-gray-700">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    id="flightNumberInput"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="mt-1 input-field"
                    placeholder="e.g., SQ12, AA123"
                  />
                </div>
                <div>
                  <label htmlFor="flightDateInput" className="block text-sm font-medium text-gray-700">
                    Flight Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="flightDateInput"
                    value={flightDate}
                    onChange={(e) => setFlightDate(e.target.value)}
                    className="mt-1 input-field"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleFlightLookup}
                    disabled={lookupLoading || !flightNumber.trim()}
                    className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {lookupLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Looking up...
                      </>
                    ) : (
                      'Lookup Flight'
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Enter your flight number (e.g., SQ12, AA123) and we'll automatically fetch the flight details.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Route Information Form - Only show when route method is selected */}
            {inputMethod === 'route' && (
              <>
                {/* Route Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-jetlag-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Route Information
              </h3>
              
              {/* Origin */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label htmlFor="origin" className="block text-sm font-medium text-gray-700">
                    Origin City
                  </label>
                  <input
                    type="text"
                    name="origin"
                    id="origin"
                    required
                    value={formData.origin}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                    placeholder="e.g., Singapore"
                  />
                </div>
                <div>
                  <label htmlFor="originTimezone" className="block text-sm font-medium text-gray-700">
                    Origin Timezone
                  </label>
                  <select
                    name="originTimezone"
                    id="originTimezone"
                    required
                    value={formData.originTimezone}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                  >
                    <option value="">Select timezone</option>
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                    Destination City
                  </label>
                  <input
                    type="text"
                    name="destination"
                    id="destination"
                    required
                    value={formData.destination}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                    placeholder="e.g., Los Angeles"
                  />
                </div>
                <div>
                  <label htmlFor="destinationTimezone" className="block text-sm font-medium text-gray-700">
                    Destination Timezone
                  </label>
                  <select
                    name="destinationTimezone"
                    id="destinationTimezone"
                    required
                    value={formData.destinationTimezone}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                  >
                    <option value="">Select timezone</option>
                    {timezones.map(tz => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule Information Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 text-jetlag-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Schedule Information
              </h3>
              
              {/* Departure */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-6">
                <div>
                  <label htmlFor="departureDate" className="block text-sm font-medium text-gray-700">
                    Departure Date
                  </label>
                  <input
                    type="date"
                    name="departureDate"
                    id="departureDate"
                    required
                    value={formData.departureDate}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                  />
                </div>
                <div>
                  <label htmlFor="departureTime" className="block text-sm font-medium text-gray-700">
                    Departure Time (Local)
                  </label>
                  <input
                    type="time"
                    name="departureTime"
                    id="departureTime"
                    required
                    value={formData.departureTime}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
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
                  <input
                    type="time"
                    name="arrivalTime"
                    id="arrivalTime"
                    required
                    value={formData.arrivalTime}
                    onChange={handleInputChange}
                    className="mt-1 input-field"
                  />
                </div>
              </div>

              {/* Flight Duration */}
              <div>
                <label htmlFor="flightDuration" className="block text-sm font-medium text-gray-700">
                  Total Flight Duration (minutes)
                </label>
                <input
                  type="number"
                  name="flightDuration"
                  id="flightDuration"
                  required
                  min="1"
                  value={formData.flightDuration}
                  onChange={handleInputChange}
                  className="mt-1 input-field"
                  placeholder="e.g., 900"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Include all flight time including layovers
                </p>
              </div>
            </div>

            {/* Layovers Section */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 text-jetlag-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Layovers (Optional)
                </h3>
                <button
                  type="button"
                  onClick={addLayover}
                  className="text-sm text-jetlag-600 hover:text-jetlag-500 font-medium"
                >
                  + Add Layover
                </button>
              </div>
              
              {formData.layovers.map((layover, index) => (
                <div key={index} className="mt-4 p-6 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Layover {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeLayover(index)}
                      className="text-red-600 hover:text-red-500 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Airport Code
                      </label>
                      <input
                        type="text"
                        value={layover.airport}
                        onChange={(e) => updateLayover(index, 'airport', e.target.value)}
                        className="mt-1 input-field"
                        placeholder="e.g., NRT"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Arrival Time
                      </label>
                      <input
                        type="time"
                        value={layover.arrivalTime}
                        onChange={(e) => updateLayover(index, 'arrivalTime', e.target.value)}
                        className="mt-1 input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Departure Time
                      </label>
                      <input
                        type="time"
                        value={layover.departureTime}
                        onChange={(e) => updateLayover(index, 'departureTime', e.target.value)}
                        className="mt-1 input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Duration (min)
                      </label>
                      <input
                        type="number"
                        value={layover.duration}
                        onChange={(e) => updateLayover(index, 'duration', e.target.value)}
                        className="mt-1 input-field"
                        placeholder="e.g., 120"
                      />
                    </div>
                  </div>
                </div>
              ))}
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
        <div className="flex justify-center pt-8">
          {(inputMethod === 'route' || (inputMethod === 'flight' && formData.origin && formData.destination)) && (
            <button
              onClick={handleSubmit}
              disabled={loading}
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
                  {editMode ? 'Update My Trip Plan' : 'Generate My Jet Lag Plan'}
                  <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
