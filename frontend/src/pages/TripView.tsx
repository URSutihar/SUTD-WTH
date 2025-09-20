import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import ChronoPlanPreview from '../components/ChronoPlanPreview/ChronoPlanPreview'
import { ArrowLeft, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

const TripView: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { 
    currentTrip, 
    setCurrentTrip, 
    plan, 
    isLoadingPlan, 
    generatePlan 
  } = useTrip()

  useEffect(() => {
    if (tripId && !currentTrip) {
      // In a real app, you'd fetch the trip by ID
      // For now, we'll assume it's set in context
    }
  }, [tripId, currentTrip])

  const handleGeneratePlan = async () => {
    if (tripId) {
      try {
        await generatePlan(tripId, true)
      } catch (error) {
        console.error('Failed to generate plan:', error)
      }
    }
  }

  if (!currentTrip) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Trip Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The trip you're looking for doesn't exist or you don't have access to it.
          </p>
          <button
            onClick={() => navigate('/history')}
            className="btn-primary"
          >
            View All Trips
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentTrip.origin_location.name} → {currentTrip.destination_location.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Departure: {new Date(currentTrip.departure_utc).toLocaleString()}
            </p>
          </div>
          
          <button
            onClick={handleGeneratePlan}
            disabled={isLoadingPlan}
            className="btn-outline flex items-center"
          >
            {isLoadingPlan ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isLoadingPlan ? 'Generating...' : 'Regenerate Plan'}
          </button>
        </div>
      </div>

      {/* Trip Details */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="card-content">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Origin
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {currentTrip.origin_location.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentTrip.origin_timezone}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Destination
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {currentTrip.destination_location.name}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentTrip.destination_timezone}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Flight Duration
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {Math.floor(currentTrip.flight_duration_minutes / 60)}h {currentTrip.flight_duration_minutes % 60}m
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Arrival: {new Date(currentTrip.arrival_utc).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Plan */}
      {isLoadingPlan ? (
        <div className="card">
          <div className="card-content text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Generating Your Plan
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI is creating a personalized chronobiology plan for your trip...
            </p>
          </div>
        </div>
      ) : plan ? (
        <ChronoPlanPreview plan={plan} />
      ) : (
        <div className="card">
          <div className="card-content text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Plan Generated
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Generate a personalized chronobiology plan to help you adjust to the new timezone.
            </p>
            <button
              onClick={handleGeneratePlan}
              className="btn-primary"
            >
              Generate Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TripView
