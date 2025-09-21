import { useState, useEffect } from 'react'

export const ReminderScheduler = ({ schedule, tripId }) => {
  const [reminders, setReminders] = useState([])
  const [activeReminders, setActiveReminders] = useState(new Set())

  useEffect(() => {
    // Extract reminders from schedule
    if (schedule?.phases) {
      const extractedReminders = []
      schedule.phases.forEach(phase => {
        phase.actions?.forEach(action => {
          if (action.priority === 'high' || action.type === 'melatonin' || action.type === 'sleep') {
            extractedReminders.push({
              id: action.action_id,
              action: action,
              scheduled: false
            })
          }
        })
      })
      setReminders(extractedReminders)
    }
  }, [schedule])

  const scheduleReminder = (reminderId) => {
    const reminder = reminders.find(r => r.id === reminderId)
    if (!reminder) return

    const action = reminder.action
    const reminderTime = new Date(action.when_local)
    const now = new Date()

    if (reminderTime <= now) {
      alert('This action is in the past and cannot be scheduled as a reminder.')
      return
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime()

    const timeoutId = setTimeout(() => {
      showInAppReminder(action)
    }, timeUntilReminder)

    setActiveReminders(prev => new Set([...prev, reminderId]))
    
    // Update reminder status
    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, scheduled: true, timeoutId } : r
    ))

    alert(`Reminder scheduled for ${reminderTime.toLocaleString()}`)
  }

  const cancelReminder = (reminderId) => {
    const reminder = reminders.find(r => r.id === reminderId)
    if (reminder?.timeoutId) {
      clearTimeout(reminder.timeoutId)
    }

    setActiveReminders(prev => {
      const newSet = new Set(prev)
      newSet.delete(reminderId)
      return newSet
    })

    setReminders(prev => prev.map(r => 
      r.id === reminderId ? { ...r, scheduled: false, timeoutId: null } : r
    ))
  }

  const showInAppReminder = (action) => {
    // Create a notification-like element
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-jetlag-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">Snorelags Reminder</h3>
          <p class="mt-1 text-sm">${action.details}</p>
          <p class="mt-1 text-xs opacity-75">${action.type.replace('_', ' ').toUpperCase()}</p>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `

    document.body.appendChild(notification)

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  const exportToCalendar = (action) => {
    const startTime = new Date(action.when_local)
    const endTime = new Date(startTime.getTime() + (action.duration_minutes || 30) * 60000)

    const formatDate = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Snorelags//EN',
      'BEGIN:VEVENT',
      `UID:${action.action_id}@snorelags.com`,
      `DTSTART:${formatDate(startTime)}`,
      `DTEND:${formatDate(endTime)}`,
      `SUMMARY:${action.type.replace('_', ' ').toUpperCase()}: ${action.details}`,
      `DESCRIPTION:${action.details}${action.safety_notes ? '\\n\\nSafety Note: ' + action.safety_notes : ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n')

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `jetlag-reminder-${action.action_id}.ics`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
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

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No reminders available for this trip</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">In-App Reminders</h3>
            <p className="mt-1 text-sm text-blue-700">
              Reminders will only work while the app is open. For persistent reminders, export to your calendar app.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {reminders.map((reminder) => {
          const action = reminder.action
          const isScheduled = activeReminders.has(reminder.id)
          const reminderTime = new Date(action.when_local)
          const isPast = reminderTime <= new Date()

          return (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border ${
                isScheduled 
                  ? 'bg-green-50 border-green-200' 
                  : isPast 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getActionIcon(action.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {action.type.replace('_', ' ').toUpperCase()}
                      </h4>
                      {action.priority === 'high' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          High Priority
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-600">{action.details}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {reminderTime.toLocaleString()}
                      {isPast && <span className="ml-2 text-red-600">(Past)</span>}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {!isPast && (
                    <button
                      onClick={() => isScheduled ? cancelReminder(reminder.id) : scheduleReminder(reminder.id)}
                      className={`px-3 py-1 text-xs font-medium rounded-md ${
                        isScheduled
                          ? 'bg-red-100 text-red-800 hover:bg-red-200'
                          : 'bg-jetlag-100 text-jetlag-800 hover:bg-jetlag-200'
                      }`}
                    >
                      {isScheduled ? 'Cancel' : 'Schedule'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => exportToCalendar(action)}
                    className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200"
                  >
                    Export to Calendar
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
