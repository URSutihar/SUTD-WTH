import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import TripPlannerForm from '../components/TripPlannerForm/TripPlannerForm'
import { ArrowLeft, Loader2 } from 'lucide-react'

const NewTrip: React.FC = () => {
  const navigate = useNavigate()
  const { createTrip } = useTrip()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateTrip = async (tripData: any) => {
    setIsCreating(true)
    try {
      const newTrip = await createTrip(tripData)
      navigate(`/trip/${newTrip.id}`)
    } catch (error) {
      console.error('Failed to create trip:', error)
      // Handle error (show toast, etc.)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
        
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Plan Your Trip
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Enter your travel details to get a personalized jet lag adjustment plan
        </p>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-content">
          {isCreating ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-300">
                Creating your trip...
              </span>
            </div>
          ) : (
            <TripPlannerForm onSubmit={handleCreateTrip} />
          )}
        </div>
      </div>
    </div>
  )
}

export default NewTrip
