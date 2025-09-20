import React, { useState } from 'react'
import { format, parseISO } from 'date-fns'
import DayChecklist from '../DayChecklist/DayChecklist'
import { Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react'

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

interface ChronoPlanPreviewProps {
  plan: ChronoPlan
}

const ChronoPlanPreview: React.FC<ChronoPlanPreviewProps> = ({ plan }) => {
  const [selectedDay, setSelectedDay] = useState(0)

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'light':
        return '☀️'
      case 'meal':
        return '🍽️'
      case 'hydration':
        return '💧'
      case 'sleep':
        return '😴'
      case 'melatonin':
        return '💊'
      case 'caffeine':
        return '☕'
      case 'activity':
        return '🏃'
      default:
        return '📋'
    }
  }

  const getActionColor = (type: string) => {
    switch (type) {
      case 'light':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'meal':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'hydration':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'sleep':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'melatonin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'caffeine':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'activity':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'EEEE, MMMM d')
    } catch {
      return dateString
    }
  }

  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(':')
      const date = new Date()
      date.setHours(parseInt(hours), parseInt(minutes))
      return format(date, 'h:mm a')
    } catch {
      return timeString
    }
  }

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Your Chronobiology Plan
            </h2>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4 mr-1" />
              Generated {format(parseISO(plan.generated_at), 'MMM d, yyyy')}
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Medical Disclaimer
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  This app provides general guidance, not medical advice. Consult a healthcare 
                  professional before using melatonin or making significant changes to sleep 
                  or medication routines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigation */}
      <div className="card">
        <div className="card-content">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Plan Timeline
          </h3>
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {plan.days.map((day, index) => (
              <button
                key={index}
                onClick={() => setSelectedDay(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === index
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {formatDate(day.date_local)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {formatDate(plan.days[selectedDay]?.date_local)}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {plan.days[selectedDay]?.actions.length} scheduled activities
          </p>
        </div>
        
        <div className="card-content">
          <div className="space-y-4">
            {plan.days[selectedDay]?.actions.map((action, actionIndex) => (
              <div
                key={actionIndex}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getActionIcon(action.type)}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                          {action.type}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(action.type)}`}>
                          {action.type}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatTime(action.start_local)}
                        {action.end_local && ` - ${formatTime(action.end_local)}`}
                      </div>
                    </div>
                  </div>
                  
                  {action.confidence_score && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {Math.round(action.confidence_score * 100)}% confidence
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 dark:text-gray-300">
                  {action.instruction}
                </p>
                
                {action.metadata && Object.keys(action.metadata).length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        Additional Details
                      </summary>
                      <div className="mt-2 space-y-1">
                        {Object.entries(action.metadata).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500 dark:text-gray-400 capitalize">
                              {key.replace(/_/g, ' ')}:
                            </span>
                            <span className="text-gray-700 dark:text-gray-300">
                              {String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </details>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Day Checklist */}
      <DayChecklist 
        day={plan.days[selectedDay]} 
        onActionComplete={(actionIndex) => {
          // Handle action completion
          console.log('Action completed:', actionIndex)
        }}
        onActionSnooze={(actionIndex) => {
          // Handle action snooze
          console.log('Action snoozed:', actionIndex)
        }}
      />
    </div>
  )
}

export default ChronoPlanPreview
