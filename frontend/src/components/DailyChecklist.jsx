import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api'

export const DailyChecklist = ({ schedule, tripId }) => {
  const [completedActions, setCompletedActions] = useState(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load completed actions from the schedule
    if (schedule?.phases) {
      const completed = new Set()
      schedule.phases.forEach(phase => {
        phase.actions?.forEach(action => {
          if (action.completed) {
            completed.add(action.action_id)
          }
        })
      })
      setCompletedActions(completed)
    }
  }, [schedule])

  const toggleAction = async (actionId, completed) => {
    setLoading(true)
    try {
      await apiClient.markActionComplete(actionId, completed)
      setCompletedActions(prev => {
        const newSet = new Set(prev)
        if (completed) {
          newSet.add(actionId)
        } else {
          newSet.delete(actionId)
        }
        return newSet
      })
    } catch (error) {
      console.error('Error updating action:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionIcon = (type) => {
    const icons = {
      light: '☀️',
      avoid_light: '🌙',
      sleep: '😴',
      nap: '💤',
      meal: '🍽️',
      hydrate: '💧',
      melatonin: '💊',
      caffeine: '☕',
      activity: '🏃'
    }
    return icons[type] || '📋'
  }

  const groupActionsByDate = () => {
    if (!schedule?.phases) return {}

    const grouped = {}
    schedule.phases.forEach(phase => {
      phase.actions?.forEach(action => {
        const date = new Date(action.when_local).toDateString()
        if (!grouped[date]) {
          grouped[date] = []
        }
        grouped[date].push(action)
      })
    })

    // Sort actions within each day by time
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(a.when_local) - new Date(b.when_local))
    })

    return grouped
  }

  const groupedActions = groupActionsByDate()
  const totalActions = Object.values(groupedActions).flat().length
  const completedCount = completedActions.size
  const progressPercentage = totalActions > 0 ? Math.round((completedCount / totalActions) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-900">Progress</h3>
          <span className="text-sm text-gray-500">{completedCount} of {totalActions} completed</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-jetlag-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="mt-2 text-xs text-gray-500">{progressPercentage}% complete</p>
      </div>

      {/* Daily Checklists */}
      {Object.entries(groupedActions).map(([date, actions]) => (
        <div key={date} className="border border-gray-200 rounded-lg">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-900">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <p className="text-xs text-gray-500">
              {actions.filter(action => completedActions.has(action.action_id)).length} of {actions.length} completed
            </p>
          </div>
          
          <div className="p-4 space-y-3">
            {actions.map((action, index) => {
              const isCompleted = completedActions.has(action.action_id)
              const isOverdue = new Date(action.when_local) < new Date() && !isCompleted
              
              return (
                <div
                  key={action.action_id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    isCompleted 
                      ? 'bg-green-50 border-green-200' 
                      : isOverdue 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-white border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleAction(action.action_id, !isCompleted)}
                    disabled={loading}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-jetlag-500'
                    }`}
                  >
                    {isCompleted && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getActionIcon(action.type)}</span>
                      <span className={`text-sm font-medium ${
                        isCompleted ? 'text-green-800 line-through' : 'text-gray-900'
                      }`}>
                        {action.type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        action.priority === 'high' 
                          ? 'bg-red-100 text-red-800'
                          : action.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}>
                        {action.priority}
                      </span>
                    </div>
                    
                    <p className={`mt-1 text-sm ${
                      isCompleted ? 'text-green-700' : 'text-gray-600'
                    }`}>
                      {action.details}
                    </p>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        {new Date(action.when_local).toLocaleTimeString()}
                      </span>
                      {action.duration_minutes && (
                        <span>Duration: {action.duration_minutes}min</span>
                      )}
                      {action.dose_mg && (
                        <span>Dose: {action.dose_mg}mg</span>
                      )}
                    </div>
                    
                    {action.safety_notes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                        <strong>Safety Note:</strong> {action.safety_notes}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {Object.keys(groupedActions).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No actions available</p>
        </div>
      )}
    </div>
  )
}
