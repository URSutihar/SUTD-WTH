import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { timezones } from '../utils/timezones'

export const TripPlanner = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
    layovers: []
  })

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
      layovers: [...prev.layovers, { airport: '', arrivalTime: '', departureTime: '' }]
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
            departure_utc: new Date(`${formData.departureDate}T${layover.departureTime}`).toISOString()
          }))
        },
        preferences: {
          max_caffeine_mg: 200,
          melatonin_preference_mg: 1,
          avoid_medications: false
        }
      }

      const response = await apiClient.generatePlan(tripData)
      
      // The trip is created in the backend during plan generation
      // Navigate to the trip using the trip_id from the response
      navigate(`/trip/${response.trip_id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Plan Your Trip</h1>
        <p className="mt-2 text-gray-600">
          Get a personalized circadian plan to prevent or fix jet lag
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Origin */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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

        {/* Departure */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              Departure Time
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              Arrival Time
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
            Flight Duration (minutes)
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
        </div>

        {/* Layovers */}
        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Layovers (optional)
            </label>
            <button
              type="button"
              onClick={addLayover}
              className="text-sm text-jetlag-600 hover:text-jetlag-500"
            >
              + Add Layover
            </button>
          </div>
          
          {formData.layovers.map((layover, index) => (
            <div key={index} className="mt-4 p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Airport
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
                  <div className="flex">
                    <input
                      type="time"
                      value={layover.departureTime}
                      onChange={(e) => updateLayover(index, 'departureTime', e.target.value)}
                      className="mt-1 input-field"
                    />
                    <button
                      type="button"
                      onClick={() => removeLayover(index)}
                      className="ml-2 mt-1 text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating Plan...' : 'Generate Plan'}
          </button>
        </div>
      </form>
    </div>
  )
}
