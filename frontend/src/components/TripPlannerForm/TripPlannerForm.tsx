import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { TimezoneService } from '../../services/timezone'
import { Search, MapPin, Calendar, Clock, User } from 'lucide-react'

interface Location {
  lat: number
  lon: number
  name: string
  iata?: string
  timezone?: string
}

interface TripFormData {
  origin: Location
  destination: Location
  departure_utc: string
  arrival_utc: string
  layovers: any[]
  user_preferences: {
    chronotype: 'morning' | 'evening' | 'neutral'
    sensitivity: 'low' | 'medium' | 'high'
    preferred_bedtime_local: string
  }
}

interface TripPlannerFormProps {
  onSubmit: (data: TripFormData) => void
}

const TripPlannerForm: React.FC<TripPlannerFormProps> = ({ onSubmit }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<TripFormData>()
  const [originSearch, setOriginSearch] = useState('')
  const [destinationSearch, setDestinationSearch] = useState('')
  const [originSuggestions, setOriginSuggestions] = useState<any[]>([])
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([])
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false)
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false)

  const watchedOrigin = watch('origin')
  const watchedDestination = watch('destination')
  const watchedDeparture = watch('departure_utc')
  const watchedArrival = watch('arrival_utc')

  // Search for locations
  const searchLocations = async (query: string) => {
    if (query.length < 2) return []
    
    try {
      // In a real app, you'd call a geocoding API
      // For now, we'll use a mock search
      const mockResults = [
        { name: 'Singapore Changi Airport', iata: 'SIN', timezone: 'Asia/Singapore', lat: 1.3521, lon: 103.8198 },
        { name: 'London Heathrow Airport', iata: 'LHR', timezone: 'Europe/London', lat: 51.4700, lon: -0.4543 },
        { name: 'New York JFK Airport', iata: 'JFK', timezone: 'America/New_York', lat: 40.6413, lon: -73.7781 },
        { name: 'Tokyo Haneda Airport', iata: 'HND', timezone: 'Asia/Tokyo', lat: 35.5494, lon: 139.7798 },
        { name: 'Sydney Kingsford Smith Airport', iata: 'SYD', timezone: 'Australia/Sydney', lat: -33.9399, lon: 151.1753 }
      ]
      
      return mockResults.filter(location => 
        location.name.toLowerCase().includes(query.toLowerCase()) ||
        location.iata?.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Location search error:', error)
      return []
    }
  }

  // Handle origin search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (originSearch) {
        const results = await searchLocations(originSearch)
        setOriginSuggestions(results)
        setShowOriginSuggestions(true)
      } else {
        setOriginSuggestions([])
        setShowOriginSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [originSearch])

  // Handle destination search
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (destinationSearch) {
        const results = await searchLocations(destinationSearch)
        setDestinationSuggestions(results)
        setShowDestinationSuggestions(true)
      } else {
        setDestinationSuggestions([])
        setShowDestinationSuggestions(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [destinationSearch])

  const selectLocation = (location: any, type: 'origin' | 'destination') => {
    setValue(type, {
      lat: location.lat,
      lon: location.lon,
      name: location.name,
      iata: location.iata,
      timezone: location.timezone
    })
    
    if (type === 'origin') {
      setOriginSearch(location.name)
      setShowOriginSuggestions(false)
    } else {
      setDestinationSearch(location.name)
      setShowDestinationSuggestions(false)
    }
  }

  const calculateFlightDuration = () => {
    if (watchedDeparture && watchedArrival) {
      const departure = new Date(watchedDeparture)
      const arrival = new Date(watchedArrival)
      const duration = arrival.getTime() - departure.getTime()
      const hours = Math.floor(duration / (1000 * 60 * 60))
      const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60))
      return `${hours}h ${minutes}m`
    }
    return null
  }

  const getTimezoneInfo = (location: Location) => {
    if (location?.timezone) {
      return TimezoneService.getTimezoneInfo(location.timezone)
    }
    return null
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Origin */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Origin
        </label>
        <div className="relative">
          <input
            type="text"
            value={originSearch}
            onChange={(e) => setOriginSearch(e.target.value)}
            placeholder="Search for origin airport or city..."
            className="input w-full"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {originSuggestions.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(location, 'origin')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {location.iata} • {location.timezone}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {watchedOrigin && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getTimezoneInfo(watchedOrigin)?.name} ({getTimezoneInfo(watchedOrigin)?.offset})
          </div>
        )}
      </div>

      {/* Destination */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          <MapPin className="w-4 h-4 inline mr-1" />
          Destination
        </label>
        <div className="relative">
          <input
            type="text"
            value={destinationSearch}
            onChange={(e) => setDestinationSearch(e.target.value)}
            placeholder="Search for destination airport or city..."
            className="input w-full"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          
          {showDestinationSuggestions && destinationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
              {destinationSuggestions.map((location, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(location, 'destination')}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                >
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {location.iata} • {location.timezone}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {watchedDestination && (
          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {getTimezoneInfo(watchedDestination)?.name} ({getTimezoneInfo(watchedDestination)?.offset})
          </div>
        )}
      </div>

      {/* Flight Times */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Departure Time (UTC)
          </label>
          <input
            type="datetime-local"
            {...register('departure_utc', { required: 'Departure time is required' })}
            className="input w-full"
          />
          {errors.departure_utc && (
            <p className="mt-1 text-sm text-red-600">{errors.departure_utc.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Arrival Time (UTC)
          </label>
          <input
            type="datetime-local"
            {...register('arrival_utc', { required: 'Arrival time is required' })}
            className="input w-full"
          />
          {errors.arrival_utc && (
            <p className="mt-1 text-sm text-red-600">{errors.arrival_utc.message}</p>
          )}
        </div>
      </div>

      {/* Flight Duration */}
      {calculateFlightDuration() && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            Flight Duration: {calculateFlightDuration()}
          </div>
        </div>
      )}

      {/* User Preferences */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          <User className="w-5 h-5 inline mr-2" />
          Your Preferences
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chronotype
            </label>
            <select
              {...register('user_preferences.chronotype', { required: true })}
              className="input w-full"
            >
              <option value="morning">Morning Person</option>
              <option value="evening">Evening Person</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Jet Lag Sensitivity
            </label>
            <select
              {...register('user_preferences.sensitivity', { required: true })}
              className="input w-full"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preferred Bedtime
            </label>
            <input
              type="time"
              {...register('user_preferences.preferred_bedtime_local', { required: true })}
              className="input w-full"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary px-8 py-3"
        >
          Create Trip Plan
        </button>
      </div>
    </form>
  )
}

export default TripPlannerForm
