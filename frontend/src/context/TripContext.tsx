import React, { createContext, useContext, useState, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../services/apiClient'

interface Location {
  lat: number
  lon: number
  name: string
  iata?: string
  timezone?: string
}

interface Layover {
  arrival_utc: string
  departure_utc: string
  timezone: string
  location: Location
}

interface UserPreferences {
  chronotype: 'morning' | 'evening' | 'neutral'
  sensitivity: 'low' | 'medium' | 'high'
  preferred_bedtime_local: string
}

interface Trip {
  id: string
  user_id: string
  origin_timezone: string
  origin_location: Location
  destination_timezone: string
  destination_location: Location
  departure_utc: string
  arrival_utc: string
  layovers: Layover[]
  flight_duration_minutes: number
  created_at: string
}

interface Action {
  type: 'light' | 'meal' | 'hydration' | 'sleep' | 'melatonin' | 'caffeine' | 'activity'
  start_local: string
  end_local?: string
  instruction: string
  confidence_score?: number
  source: string
  metadata?: Record<string, any>
}

interface DayAction {
  date_local: string
  actions: Action[]
}

interface ChronoPlan {
  id: string
  trip_id: string
  generated_at: string
  version: string
  days: DayAction[]
  raw_gemini_response?: any
}

interface TripContextType {
  currentTrip: Trip | null
  setCurrentTrip: (trip: Trip | null) => void
  trips: Trip[]
  isLoadingTrips: boolean
  createTrip: (tripData: any) => Promise<Trip>
  updateTrip: (tripId: string, updates: any) => Promise<Trip>
  deleteTrip: (tripId: string) => Promise<void>
  generatePlan: (tripId: string, forceRegenerate?: boolean) => Promise<any>
  plan: ChronoPlan | null
  isLoadingPlan: boolean
}

const TripContext = createContext<TripContextType | undefined>(undefined)

export const useTrip = () => {
  const context = useContext(TripContext)
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider')
  }
  return context
}

interface TripProviderProps {
  children: ReactNode
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null)
  const queryClient = useQueryClient()

  // Fetch trips
  const { data: trips = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: ['trips'],
    queryFn: apiClient.getTrips,
    enabled: true
  })

  // Fetch plan for current trip
  const { data: plan = null, isLoading: isLoadingPlan } = useQuery({
    queryKey: ['plan', currentTrip?.id],
    queryFn: () => apiClient.getPlan(currentTrip!.id),
    enabled: !!currentTrip
  })

  const createTripMutation = useMutation({
    mutationFn: apiClient.createTrip,
    onSuccess: (newTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      setCurrentTrip(newTrip)
    }
  })

  const updateTripMutation = useMutation({
    mutationFn: ({ tripId, updates }: { tripId: string; updates: any }) =>
      apiClient.updateTrip(tripId, updates),
    onSuccess: (updatedTrip) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      if (currentTrip?.id === updatedTrip.id) {
        setCurrentTrip(updatedTrip)
      }
    }
  })

  const deleteTripMutation = useMutation({
    mutationFn: apiClient.deleteTrip,
    onSuccess: (_, tripId) => {
      queryClient.invalidateQueries({ queryKey: ['trips'] })
      if (currentTrip?.id === tripId) {
        setCurrentTrip(null)
      }
    }
  })

  const generatePlanMutation = useMutation({
    mutationFn: ({ tripId, forceRegenerate }: { tripId: string; forceRegenerate?: boolean }) =>
      apiClient.generatePlan(tripId, forceRegenerate),
    onSuccess: (_, { tripId }) => {
      queryClient.invalidateQueries({ queryKey: ['plan', tripId] })
    }
  })

  const createTrip = async (tripData: any) => {
    return createTripMutation.mutateAsync(tripData)
  }

  const updateTrip = async (tripId: string, updates: any) => {
    return updateTripMutation.mutateAsync({ tripId, updates })
  }

  const deleteTrip = async (tripId: string) => {
    return deleteTripMutation.mutateAsync(tripId)
  }

  const generatePlan = async (tripId: string, forceRegenerate = false) => {
    return generatePlanMutation.mutateAsync({ tripId, forceRegenerate })
  }

  const value: TripContextType = {
    currentTrip,
    setCurrentTrip,
    trips,
    isLoadingTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    generatePlan,
    plan,
    isLoadingPlan
  }

  return (
    <TripContext.Provider value={value}>
      {children}
    </TripContext.Provider>
  )
}
