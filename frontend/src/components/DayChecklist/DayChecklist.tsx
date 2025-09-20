import React, { useState } from 'react'
import { Check, Clock, Bell, BellOff } from 'lucide-react'

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

interface DayChecklistProps {
  day: DayAction
  onActionComplete: (actionIndex: number) => void
  onActionSnooze: (actionIndex: number) => void
}

const DayChecklist: React.FC<DayChecklistProps> = ({ 
  day, 
  onActionComplete, 
  onActionSnooze 
}) => {
  const [completedActions, setCompletedActions] = useState<Set<number>>(new Set())
  const [snoozedActions, setSnoozedActions] = useState<Set<number>>(new Set())

  const handleComplete = (actionIndex: number) => {
    setCompletedActions(prev => new Set([...prev, actionIndex]))
    setSnoozedActions(prev => {
      const newSet = new Set(prev)
      newSet.delete(actionIndex)
      return newSet
    })
    onActionComplete(actionIndex)
  }

  const handleSnooze = (actionIndex: number) => {
    setSnoozedActions(prev => new Set([...prev, actionIndex]))
    setCompletedActions(prev => {
      const newSet = new Set(prev)
      newSet.delete(actionIndex)
      return newSet
    })
    onActionSnooze(actionIndex)
  }

  const isActionUpcoming = (action: Action) => {
    const now = new Date()
    const [hours, minutes] = action.start_local.split(':')
    const actionTime = new Date()
    actionTime.setHours(parseInt(hours), parseInt(minutes))
    
    return actionTime > now
  }

  const isActionOverdue = (action: Action) => {
    const now = new Date()
    const [hours, minutes] = action.start_local.split(':')
    const actionTime = new Date()
    actionTime.setHours(parseInt(hours), parseInt(minutes))
    
    // Consider overdue if it's been more than 30 minutes past the start time
    const overdueTime = new Date(actionTime.getTime() + 30 * 60000)
    return now > overdueTime
  }

  const getActionStatus = (actionIndex: number, action: Action) => {
    if (completedActions.has(actionIndex)) {
      return 'completed'
    }
    if (snoozedActions.has(actionIndex)) {
      return 'snoozed'
    }
    if (isActionOverdue(action)) {
      return 'overdue'
    }
    if (isActionUpcoming(action)) {
      return 'upcoming'
    }
    return 'current'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
      case 'snoozed':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
      case 'overdue':
        return 'bg-red-100 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200'
      case 'current':
        return 'bg-blue-100 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200'
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'snoozed':
        return 'Snoozed'
      case 'overdue':
        return 'Overdue'
      case 'current':
        return 'Now'
      default:
        return 'Upcoming'
    }
  }

  if (!day || !day.actions.length) {
    return (
      <div className="card">
        <div className="card-content text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No actions scheduled for this day.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Daily Checklist
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Track your progress and stay on schedule
        </p>
      </div>
      
      <div className="card-content">
        <div className="space-y-3">
          {day.actions.map((action, index) => {
            const status = getActionStatus(index, action)
            const isCompleted = status === 'completed'
            const isSnoozed = status === 'snoozed'
            
            return (
              <div
                key={index}
                className={`border rounded-lg p-4 transition-all ${
                  isCompleted 
                    ? 'opacity-75' 
                    : isSnoozed 
                    ? 'opacity-90' 
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <button
                      onClick={() => handleComplete(index)}
                      disabled={isCompleted}
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : 'border-gray-300 hover:border-green-500 hover:bg-green-50 dark:border-gray-600 dark:hover:border-green-500 dark:hover:bg-green-900/20'
                      }`}
                    >
                      {isCompleted && <Check className="w-3 h-3" />}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {action.instruction}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          {getStatusText(status)}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 mr-1" />
                        {action.start_local}
                        {action.end_local && ` - ${action.end_local}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {!isCompleted && (
                      <button
                        onClick={() => handleSnooze(index)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSnoozed
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400'
                            : 'text-gray-400 hover:bg-gray-100 hover:text-yellow-600 dark:hover:bg-gray-700 dark:hover:text-yellow-400'
                        }`}
                        title={isSnoozed ? 'Snoozed' : 'Snooze for 30 minutes'}
                      >
                        {isSnoozed ? (
                          <BellOff className="w-4 h-4" />
                        ) : (
                          <Bell className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Progress Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              Progress: {completedActions.size} of {day.actions.length} completed
            </span>
            <div className="flex items-center space-x-4">
              <span className="text-gray-500 dark:text-gray-400">
                {snoozedActions.size} snoozed
              </span>
              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(completedActions.size / day.actions.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayChecklist
