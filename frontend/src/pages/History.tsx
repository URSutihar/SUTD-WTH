import React from 'react'
import { Link } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { Calendar, MapPin, Clock, Loader2, Plus } from 'lucide-react'

const History: React.FC = () => {
  const { trips, isLoadingTrips } = useTrip()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFlightDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (isLoadingTrips) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">
            Loading your trips...
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Trip History
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          View and manage your past and upcoming trips
        </p>
      </div>

      {/* New Trip Button */}
      <div className="mb-6">
        <Link
          to="/new-trip"
          className="btn-primary inline-flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Plan New Trip
        </Link>
      </div>

      {/* Trips List */}
      {trips.length === 0 ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Trips Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Start planning your first trip to get personalized jet lag adjustment plans.
            </p>
            <Link
              to="/new-trip"
              className="btn-primary"
            >
              Plan Your First Trip
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => (
            <div key={trip.id} className="card hover:shadow-md transition-shadow">
              <div className="card-content">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {trip.origin_location.name} → {trip.destination_location.name}
                      </h3>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="font-medium">Departure:</span>
                        <br />
                        {formatDate(trip.departure_utc)} at {formatTime(trip.departure_utc)}
                      </div>
                      
                      <div>
                        <span className="font-medium">Arrival:</span>
                        <br />
                        {formatDate(trip.arrival_utc)} at {formatTime(trip.arrival_utc)}
                      </div>
                      
                      <div>
                        <span className="font-medium">Duration:</span>
                        <br />
                        <Clock className="w-4 h-4 inline mr-1" />
                        {getFlightDuration(trip.flight_duration_minutes)}
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Created {formatDate(trip.created_at)}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <Link
                      to={`/trip/${trip.id}`}
                      className="btn-outline"
                    >
                      View Plan
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default History
