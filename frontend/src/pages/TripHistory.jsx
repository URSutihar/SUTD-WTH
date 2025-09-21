import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { apiClient } from '../lib/api'
import { notificationService } from '../services/notificationService'

export const TripHistory = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({})
  const [notificationStatus, setNotificationStatus] = useState({})
  const [notificationPermission, setNotificationPermission] = useState('default')

  useEffect(() => {
    const fetchAllPlans = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await apiClient.getAllPlans(user.id)
        console.log('All plans response:', response) // Debug log
        setPlans(response.plans || [])
        setStats({
          total: response.total || 0,
          trips: response.trips_count || 0,
          shiftWork: response.shift_work_count || 0,
          sleepSchedule: response.sleep_schedule_count || 0
        })
      } catch (err) {
        console.error('Error fetching all plans:', err) // Debug log
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchAllPlans()
    }
  }, [user])

  useEffect(() => {
    // Check notification permission status
    const checkNotificationStatus = async () => {
      await notificationService.checkPermission()
      setNotificationPermission(notificationService.permission)
    }
    checkNotificationStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-jetlag-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading trips
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getPlanTypeBadge = (type) => {
    const badges = {
      trip: { text: 'Trip', bg: 'bg-blue-100', textColor: 'text-blue-800' },
      shift_work: { text: 'Shift Work', bg: 'bg-purple-100', textColor: 'text-purple-800' },
      sleep_schedule: { text: 'Sleep Schedule', bg: 'bg-green-100', textColor: 'text-green-800' }
    }
    return badges[type] || { text: 'Unknown', bg: 'bg-gray-100', textColor: 'text-gray-800' }
  }

  const getStatusBadge = (status) => {
    const badges = {
      planned: { text: 'Planned', bg: 'bg-gray-100', textColor: 'text-gray-800' },
      active: { text: 'Active', bg: 'bg-green-100', textColor: 'text-green-800' },
      in_progress: { text: 'In Progress', bg: 'bg-yellow-100', textColor: 'text-yellow-800' },
      completed: { text: 'Completed', bg: 'bg-blue-100', textColor: 'text-blue-800' }
    }
    return badges[status] || { text: 'Unknown', bg: 'bg-gray-100', textColor: 'text-gray-800' }
  }

  const getPlanRoute = (plan) => {
    switch (plan.type) {
      case 'trip':
        return `/trip/${plan.id}`
      case 'shift_work':
        return `/shift-work/plan/${plan.id}`
      case 'sleep_schedule':
        return `/sleep-schedule/plan/${plan.id}`
      default:
        return '#'
    }
  }

  const getPlanIcon = (type) => {
    const icons = {
      trip: '✈️',
      shift_work: '🕐',
      sleep_schedule: '😴'
    }
    return icons[type] || '📋'
  }

  const handleNotificationToggle = async (planId, plan) => {
    try {
      const isCurrentlyEnabled = notificationStatus[planId] || false
      
      if (!isCurrentlyEnabled) {
        // Enable notifications for this plan
        if (notificationPermission !== 'granted') {
          const granted = await notificationService.requestPermission()
          if (!granted) {
            alert('Notification permission is required to enable reminders.')
            return
          }
          setNotificationPermission('granted')
        }

        // Fetch schedule data for this plan
        let planWithSchedule = { ...plan }
        
        try {
          if (plan.type === 'trip') {
            const tripData = await apiClient.getTrip(planId)
            planWithSchedule.data = tripData
          } else if (plan.type === 'shift_work') {
            const shiftData = await apiClient.getShiftWorkPlan(planId)
            planWithSchedule.data = shiftData
          } else if (plan.type === 'sleep_schedule') {
            const sleepData = await apiClient.getSleepSchedulePlan(planId)
            planWithSchedule.data = sleepData
          }
        } catch (error) {
          console.warn('Could not fetch schedule data:', error)
        }

        // Schedule notifications for this plan
        const scheduledNotifications = await notificationService.schedulePlanReminders(planWithSchedule)
        
        setNotificationStatus(prev => ({
          ...prev,
          [planId]: true
        }))

        if (scheduledNotifications.length > 0) {
          alert(`Notifications enabled for ${plan.title}. ${scheduledNotifications.length} reminders scheduled.`)
        } else {
          alert(`Notifications enabled for ${plan.title}. No upcoming reminders found.`)
        }
      } else {
        // Disable notifications for this plan
        // Cancel all notifications for this plan
        const planNotifications = Object.keys(notificationStatus).filter(key => 
          notificationStatus[key] && key.startsWith(planId)
        )
        
        planNotifications.forEach(notificationId => {
          notificationService.cancelNotification(notificationId)
        })

        setNotificationStatus(prev => ({
          ...prev,
          [planId]: false
        }))

        alert(`Notifications disabled for ${plan.title}.`)
      }
    } catch (error) {
      console.error('Error toggling notifications:', error)
      alert(`Error: ${error.message}`)
    }
  }

  const getNotificationButtonText = (planId) => {
    const isEnabled = notificationStatus[planId] || false
    return isEnabled ? 'Disable Notifications' : 'Enable Notifications'
  }

  const getNotificationButtonStyle = (planId) => {
    const isEnabled = notificationStatus[planId] || false
    return isEnabled 
      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
      : 'bg-green-100 text-green-800 hover:bg-green-200'
  }

  const handleEditPlan = async (plan) => {
    try {
      switch (plan.type) {
        case 'trip':
          // Navigate to trip planner with edit data
          navigate('/trip/plan', { 
            state: { 
              editMode: true, 
              planId: plan.id,
              planData: plan.data,
              message: 'Edit your trip plan below' 
            } 
          })
          break
          
        case 'shift_work':
          // Navigate to shift work creation page with edit data
          navigate('/shift-work', { 
            state: { 
              editMode: true, 
              planId: plan.id,
              planData: plan.data,
              message: 'Edit your shift work plan below' 
            } 
          })
          break
          
        case 'sleep_schedule':
          // Navigate to sleep schedule creation page with edit data
          navigate('/sleep-schedule', { 
            state: { 
              editMode: true, 
              planId: plan.id,
              planData: plan.data,
              message: 'Edit your sleep schedule plan below' 
            } 
          })
          break
          
        default:
          alert('Edit functionality not available for this plan type.')
      }
    } catch (error) {
      console.error('Error handling edit:', error)
      alert('Error opening edit page. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Schedules</h1>
          <p className="mt-1 text-sm text-gray-500">
            {stats.total} total plans • {stats.trips} trips • {stats.shiftWork} shift work • {stats.sleepSchedule} sleep schedules
          </p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/trip/plan"
            className="btn-primary"
          >
            Plan Trip
          </Link>
          <Link
            to="/shift-work"
            className="btn-secondary"
          >
            Shift Work
          </Link>
          <Link
            to="/sleep-schedule"
            className="btn-secondary"
          >
            Sleep Schedule
          </Link>
        </div>
      </div>

      {!plans || plans.length === 0 ? (
        <div className="text-center py-16">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No schedules yet</h3>
          <p className="text-gray-600 mb-1 max-w-md mx-auto">
            You haven't created any sleep schedules yet. Start by choosing the type of plan that fits your needs:
          </p>
          <div className="mt-8 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">✈️</span>
                <div className="text-left">
                  <h4 className="font-medium text-blue-900">Beat Jet Lag for Your Upcoming Trip</h4>
                  <p className="text-sm text-blue-700">Get personalized recommendations for your travel</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🕐</span>
                <div className="text-left">
                  <h4 className="font-medium text-purple-900">Going to/coming from shift work</h4>
                  <p className="text-sm text-purple-700">Adjust your sleep schedule for work shifts</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">😴</span>
                <div className="text-left">
                  <h4 className="font-medium text-green-900">Fix my sleep schedule (other reasons)</h4>
                  <p className="text-sm text-green-700">Improve your sleep habits and routine</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Link
              to="/trip/plan"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 transition-colors"
            >
              ✈️ Plan Your First Trip
            </Link>
            <Link
              to="/shift-work"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              🕐 Shift Work Plan
            </Link>
            <Link
              to="/sleep-schedule"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              😴 Sleep Schedule Plan
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const typeBadge = getPlanTypeBadge(plan.type)
            const statusBadge = getStatusBadge(plan.status)
            const planRoute = getPlanRoute(plan)
            const planIcon = getPlanIcon(plan.type)

            return (
              <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{planIcon}</span>
                      <h3 className="text-lg font-medium text-gray-900">
                        {plan.title}
                      </h3>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.textColor}`}>
                        {typeBadge.text}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.textColor}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <p className="font-medium">{plan.subtitle}</p>
                    <p>Created: {new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-col space-y-2">
                    <div className="flex space-x-3">
                      <Link
                        to={planRoute}
                        className="flex-1 bg-jetlag-600 text-white text-center py-2 px-4 rounded-md text-sm font-medium hover:bg-jetlag-700"
                      >
                        View Plan
                      </Link>
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium hover:bg-gray-300"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleNotificationToggle(plan.id, plan)}
                      className={`w-full py-2 px-4 rounded-md text-sm font-medium ${getNotificationButtonStyle(plan.id)}`}
                    >
                      🔔 {getNotificationButtonText(plan.id)}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
