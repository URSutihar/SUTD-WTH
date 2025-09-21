import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { apiClient } from '../lib/api'
import { ScheduleTimeline } from '../components/ScheduleTimeline'
import { DailyChecklist } from '../components/DailyChecklist'
import { WeatherWidget } from '../components/WeatherWidget'
import { ReminderScheduler } from '../components/ReminderScheduler'
import { MusicPlayer } from '../components/MusicPlayer'

export const TripView = () => {
  const { id } = useParams()
  const [trip, setTrip] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const tripData = await apiClient.getTrip(id)
        setTrip(tripData)
        
        if (tripData.schedule) {
          setSchedule(tripData.schedule)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTrip()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jetlag-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4 sm:mx-0">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading trip
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <h3 className="text-base sm:text-lg font-medium text-gray-900">Trip not found</h3>
        <p className="mt-2 text-sm sm:text-base text-gray-500">The trip you're looking for doesn't exist.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Trip Header */}
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {trip.origin} → {trip.destination}
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Departure: {new Date(trip.departure_utc).toLocaleString()}
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              Arrival: {new Date(trip.arrival_utc).toLocaleString()}
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <div className="text-xs sm:text-sm text-gray-500">Flight Duration</div>
            <div className="text-base sm:text-lg font-semibold text-gray-900">
              {Math.floor(trip.flight_duration_minutes / 60)}h {trip.flight_duration_minutes % 60}m
            </div>
          </div>
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
              <strong>Medical Disclaimer:</strong> This app provides guidance only. Consult a physician before taking melatonin or making major changes to sleep medication. The app is not a substitute for professional medical advice.
            </p>
          </div>
        </div>
      </div>

      {/* Weather Widget */}
      <WeatherWidget destination={trip.destination} />

      {/* Schedule Timeline */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Circadian Plan</h2>
          <ScheduleTimeline schedule={schedule} />
        </div>
      )}

      {/* Daily Checklist */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Checklist</h2>
          <DailyChecklist schedule={schedule} tripId={trip.id} />
        </div>
      )}

      {/* Reminders */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reminders</h2>
          <ReminderScheduler schedule={schedule} tripId={trip.id} />
        </div>
      )}

      {/* Ambient Environment */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Ambient Environment</h2>
        <MusicPlayer />
      </div>
    </div>
  )
}
