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
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'trip', 'shift_work', 'sleep_schedule'
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showCreateDropdown && !event.target.closest('.relative')) {
        setShowCreateDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCreateDropdown])

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

  // Filter plans based on active filter
  const filteredPlans = plans.filter(plan => 
    activeFilter === 'all' || plan.type === activeFilter
  )

  // Handle filter button clicks
  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
  }

  // Handle create dropdown toggle
  const toggleCreateDropdown = () => {
    setShowCreateDropdown(!showCreateDropdown)
  }

  // Handle create plan navigation
  const handleCreatePlan = (type) => {
    setShowCreateDropdown(false)
    switch (type) {
      case 'trip':
        navigate('/trip/plan')
        break
      case 'shift_work':
        navigate('/shift-work')
        break
      case 'sleep_schedule':
        navigate('/sleep-schedule')
        break
      default:
        break
    }
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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">My Schedules</h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 break-words">
            {stats.total} total plans • {stats.trips} trips • {stats.shiftWork} shift work • {stats.sleepSchedule} sleep schedules
          </p>
        </div>
        
        {/* Create Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={toggleCreateDropdown}
            className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto min-h-[44px] px-4 py-2"
          >
            <span>+</span>
            <span className="hidden sm:inline">Create New</span>
            <span className="sm:hidden">Create</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showCreateDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
              <div className="py-1">
                <button
                  onClick={() => handleCreatePlan('trip')}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                >
                  <span className="mr-3">✈️</span>
                  Plan Trip
                </button>
                <button
                  onClick={() => handleCreatePlan('shift_work')}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                >
                  <span className="mr-3">🕐</span>
                  Shift Work Plan
                </button>
                <button
                  onClick={() => handleCreatePlan('sleep_schedule')}
                  className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                >
                  <span className="mr-3">😴</span>
                  Sleep Schedule Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeFilter === 'all'
              ? 'bg-jetlag-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All ({stats.total})
        </button>
        <button
          onClick={() => handleFilterChange('trip')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeFilter === 'trip'
              ? 'bg-blue-600 text-white'
              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
          }`}
        >
          <span className="mr-1">✈️</span>
          <span className="hidden sm:inline">Trips</span>
          <span className="sm:hidden">Trips</span>
          <span className="ml-1">({stats.trips})</span>
        </button>
        <button
          onClick={() => handleFilterChange('shift_work')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeFilter === 'shift_work'
              ? 'bg-purple-600 text-white'
              : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
          }`}
        >
          <span className="mr-1">🕐</span>
          <span className="hidden sm:inline">Shift Work</span>
          <span className="sm:hidden">Shift</span>
          <span className="ml-1">({stats.shiftWork})</span>
        </button>
        <button
          onClick={() => handleFilterChange('sleep_schedule')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] flex items-center ${
            activeFilter === 'sleep_schedule'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-800 hover:bg-green-200'
          }`}
        >
          <span className="mr-1">😴</span>
          <span className="hidden sm:inline">Sleep Schedule</span>
          <span className="sm:hidden">Sleep</span>
          <span className="ml-1">({stats.sleepSchedule})</span>
        </button>
      </div>

      {!filteredPlans || filteredPlans.length === 0 ? (
        <div className="text-center py-8 sm:py-16 px-4">
          <div className="mx-auto w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No schedules yet' : `No ${activeFilter.replace('_', ' ')} schedules`}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mb-1 max-w-md mx-auto px-4">
            {activeFilter === 'all' 
              ? "You haven't created any schedules yet. Start by choosing the type of plan that fits your needs:"
              : `You haven't created any ${activeFilter.replace('_', ' ')} schedules yet. Create your first one below:`
            }
          </p>
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4 max-w-md mx-auto px-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">✈️</span>
                <div className="text-left">
                  <h4 className="font-medium text-blue-900 text-sm sm:text-base">Beat Jet Lag for Your Upcoming Trip</h4>
                  <p className="text-xs sm:text-sm text-blue-700">Get personalized recommendations for your travel</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">🕐</span>
                <div className="text-left">
                  <h4 className="font-medium text-purple-900 text-sm sm:text-base">Going to/coming from shift work</h4>
                  <p className="text-xs sm:text-sm text-purple-700">Adjust your sleep schedule for work shifts</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl sm:text-2xl">😴</span>
                <div className="text-left">
                  <h4 className="font-medium text-green-900 text-sm sm:text-base">Fix my sleep schedule (other reasons)</h4>
                  <p className="text-xs sm:text-sm text-green-700">Improve your sleep habits and routine</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 px-4">
            {activeFilter === 'all' ? (
              <>
                <button
                  onClick={() => handleCreatePlan('trip')}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 transition-colors min-h-[44px]"
                >
                  ✈️ Plan Your First Trip
                </button>
                <button
                  onClick={() => handleCreatePlan('shift_work')}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  🕐 Shift Work Plan
                </button>
                <button
                  onClick={() => handleCreatePlan('sleep_schedule')}
                  className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-gray-300 text-sm sm:text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors min-h-[44px]"
                >
                  😴 Sleep Schedule Plan
                </button>
              </>
            ) : (
              <button
                onClick={() => handleCreatePlan(activeFilter)}
                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-jetlag-600 hover:bg-jetlag-700 transition-colors min-h-[44px]"
              >
                {activeFilter === 'trip' && '✈️ Plan Your First Trip'}
                {activeFilter === 'shift_work' && '🕐 Create Shift Work Plan'}
                {activeFilter === 'sleep_schedule' && '😴 Create Sleep Schedule Plan'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => {
            const typeBadge = getPlanTypeBadge(plan.type)
            const statusBadge = getStatusBadge(plan.status)
            const planRoute = getPlanRoute(plan)
            const planIcon = getPlanIcon(plan.type)

            return (
              <div key={plan.id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      <span className="text-lg flex-shrink-0">{planIcon}</span>
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                        {plan.title}
                      </h3>
                    </div>
                    <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${typeBadge.bg} ${typeBadge.textColor}`}>
                        {typeBadge.text}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.textColor}`}>
                        {statusBadge.text}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs sm:text-sm text-gray-500">
                    <p className="font-medium truncate">{plan.subtitle}</p>
                    <p>Created: {new Date(plan.created_at).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="mt-4 flex flex-col space-y-2">
                    <div className="flex space-x-2 sm:space-x-3">
                      <Link
                        to={planRoute}
                        className="flex-1 bg-jetlag-600 text-white text-center py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium hover:bg-jetlag-700 min-h-[44px] flex items-center justify-center"
                      >
                        View Plan
                      </Link>
                      <button 
                        onClick={() => handleEditPlan(plan)}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-300 min-h-[44px] flex items-center justify-center"
                      >
                        Edit
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleNotificationToggle(plan.id, plan)}
                      className={`w-full py-2 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium min-h-[44px] flex items-center justify-center ${getNotificationButtonStyle(plan.id)}`}
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
