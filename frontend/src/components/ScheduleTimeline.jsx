import { useState } from 'react'

export const ScheduleTimeline = ({ schedule }) => {
  const [expandedPhase, setExpandedPhase] = useState(null)

  if (!schedule || !schedule.phases) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No schedule available</p>
      </div>
    )
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

  const getActionColor = (type) => {
    const colors = {
      light: 'bg-yellow-100 text-yellow-800',
      avoid_light: 'bg-indigo-100 text-indigo-800',
      sleep: 'bg-blue-100 text-blue-800',
      nap: 'bg-purple-100 text-purple-800',
      meal: 'bg-green-100 text-green-800',
      hydrate: 'bg-cyan-100 text-cyan-800',
      melatonin: 'bg-red-100 text-red-800',
      caffeine: 'bg-orange-100 text-orange-800',
      activity: 'bg-pink-100 text-pink-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'border-red-500',
      medium: 'border-yellow-500',
      low: 'border-green-500'
    }
    return colors[priority] || 'border-gray-300'
  }

  return (
    <div className="space-y-6">
      {schedule.phases.map((phase, phaseIndex) => (
        <div key={phaseIndex} className="border border-gray-200 rounded-lg">
          <button
            onClick={() => setExpandedPhase(expandedPhase === phaseIndex ? null : phaseIndex)}
            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-jetlag-500"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900 capitalize">
                {phase.phase_name.replace('-', ' ')}
              </h3>
              <p className="text-sm text-gray-500">
                {new Date(phase.start_local).toLocaleDateString()} - {new Date(phase.end_local).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {phase.actions?.length || 0} actions
              </span>
              <svg
                className={`h-5 w-5 text-gray-400 transform transition-transform ${
                  expandedPhase === phaseIndex ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </button>

          {expandedPhase === phaseIndex && (
            <div className="px-6 pb-4 border-t border-gray-200">
              <div className="space-y-3 mt-4">
                {phase.actions?.map((action, actionIndex) => (
                  <div
                    key={actionIndex}
                    className={`p-4 rounded-lg border-l-4 ${getPriorityColor(action.priority)} bg-white shadow-sm`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">{getActionIcon(action.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(action.type)}`}>
                              {action.type.replace('_', ' ')}
                            </span>
                            {action.priority === 'high' && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                High Priority
                              </span>
                            )}
                          </div>
                          <h4 className="mt-1 text-sm font-medium text-gray-900">
                            {new Date(action.when_local).toLocaleString()}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">
                            {action.details}
                          </p>
                          {action.duration_minutes && (
                            <p className="mt-1 text-xs text-gray-500">
                              Duration: {action.duration_minutes} minutes
                            </p>
                          )}
                          {action.dose_mg && (
                            <p className="mt-1 text-xs text-gray-500">
                              Dose: {action.dose_mg}mg
                            </p>
                          )}
                          {action.safety_notes && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              <strong>Safety Note:</strong> {action.safety_notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Disclaimer */}
      {schedule.disclaimer && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Disclaimer:</strong> {schedule.disclaimer}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
