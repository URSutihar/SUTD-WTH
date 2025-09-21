import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { ScheduleTimeline } from '../components/ScheduleTimeline'
import { DailyChecklist } from '../components/DailyChecklist'
import { ReminderScheduler } from '../components/ReminderScheduler'
import { WeatherWidget } from '../components/WeatherWidget'
import { MusicPlayer } from '../components/MusicPlayer'

export const ShiftWorkPlanView = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching shift work plan with ID:', id) // Debug log
        
        // Get the shift work plan
        const planData = await apiClient.getShiftWorkPlan(id)
        console.log('Shift work plan data:', planData) // Debug log
        setPlan(planData)
        
        // Get the associated schedule
        // TODO: Implement getScheduleByPlanId in API client
        // For now, we'll use a placeholder
        setSchedule({
          schedule_version: "1.0",
          plan_type: "shift_work_adaptation",
          plan_id: id,
          timezone: "UTC",
          phases: [
            {
              phase_name: "shift_adaptation",
              start_local: "2025-01-01T00:00:00Z",
              end_local: "2025-01-01T23:59:59Z",
              goal: "Adapt to new shift schedule",
              actions: []
            }
          ],
          disclaimer: "This is a placeholder schedule. AI integration pending.",
          metadata: {
            generated_at_utc: new Date().toISOString(),
            model: "Placeholder"
          }
        })
        
      } catch (err) {
        console.error('Error fetching shift work plan:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPlan()
    }
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
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-medium mb-2">Error Loading Plan</div>
        <div className="text-red-500 mb-4">{error}</div>
        <Link to="/trips" className="btn-primary">
          Back to My Schedules
        </Link>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-600 text-lg font-medium mb-2">Plan Not Found</div>
        <Link to="/trips" className="btn-primary">
          Back to My Schedules
        </Link>
      </div>
    )
  }

  const shiftDetails = plan.shift_details || {}
  const currentSchedule = plan.current_schedule || {}
  const desiredSchedule = plan.desired_schedule || {}

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🕐 Shift Work Plan</h1>
            <p className="text-gray-600 mt-1">
              {shiftDetails.shiftType?.toUpperCase()} Shift Adaptation
            </p>
          </div>
          <Link to="/trips" className="btn-secondary">
            Back to Schedules
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Current Schedule</h3>
            <p className="text-sm text-gray-600">
              Bedtime: {currentSchedule.bedtime || 'N/A'}<br/>
              Wake Time: {currentSchedule.waketime || 'N/A'}<br/>
              Duration: {currentSchedule.sleepDuration || 'N/A'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Desired Schedule</h3>
            <p className="text-sm text-gray-600">
              Bedtime: {desiredSchedule.bedtime || 'N/A'}<br/>
              Wake Time: {desiredSchedule.waketime || 'N/A'}<br/>
              Duration: {desiredSchedule.sleepDuration || 'N/A'}
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Work Schedule</h3>
            <p className="text-sm text-gray-600">
              Type: {shiftDetails.shiftType || 'N/A'}<br/>
              Start: {shiftDetails.workStartTime || 'N/A'}<br/>
              End: {shiftDetails.workEndTime || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Timeline */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Your Shift Adaptation Plan</h2>
          <ScheduleTimeline schedule={schedule} />
        </div>
      )}

      {/* Daily Checklist */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Daily Checklist</h2>
          <DailyChecklist schedule={schedule} tripId={id} />
        </div>
      )}

      {/* Reminders */}
      {schedule && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reminders</h2>
          <ReminderScheduler schedule={schedule} tripId={id} />
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
