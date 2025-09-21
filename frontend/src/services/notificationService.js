class NotificationService {
  constructor() {
    this.isEnabled = false
    this.permission = 'default'
    this.activeNotifications = new Map() // Map of notificationId -> timeoutId
    this.checkPermission()
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission
      this.isEnabled = this.permission === 'granted'
    }
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      throw new Error('This browser does not support notifications')
    }

    if (this.permission === 'granted') {
      return true
    }

    if (this.permission === 'denied') {
      throw new Error('Notification permission has been denied. Please enable it in your browser settings.')
    }

    const permission = await Notification.requestPermission()
    this.permission = permission
    this.isEnabled = permission === 'granted'
    
    return this.isEnabled
  }

  scheduleNotification(action, planTitle, planType) {
    if (!this.isEnabled) {
      console.warn('Notifications are not enabled')
      return null
    }

    const reminderTime = new Date(action.when_local)
    const now = new Date()

    if (reminderTime <= now) {
      console.warn('Cannot schedule notification for past time')
      return null
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime()
    const notificationId = `${action.action_id}_${Date.now()}`

    const timeoutId = setTimeout(() => {
      this.showNotification(action, planTitle, planType)
      this.activeNotifications.delete(notificationId)
    }, timeUntilReminder)

    this.activeNotifications.set(notificationId, timeoutId)
    
    console.log(`Notification scheduled for ${reminderTime.toLocaleString()}`)
    return notificationId
  }

  showNotification(action, planTitle, planType) {
    if (!this.isEnabled) {
      return
    }

    const icon = this.getActionIcon(action.type)
    const title = `${icon} Snorelags Reminder`
    const body = `${action.details}\n\nPlan: ${planTitle} (${planType})`
    
    const notification = new Notification(title, {
      body: body,
      icon: '/favicon.ico', // You can add a custom icon
      badge: '/favicon.ico',
      tag: action.action_id, // Prevents duplicate notifications
      requireInteraction: true, // Keeps notification visible until user interacts
      actions: [
        {
          action: 'view',
          title: 'View Plan'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    })

    notification.onclick = () => {
      window.focus()
      // Navigate to the specific plan view
      const planRoute = this.getPlanRoute(planType, action.action_id)
      if (planRoute) {
        window.location.href = planRoute
      }
      notification.close()
    }

    // Auto-close after 30 seconds
    setTimeout(() => {
      notification.close()
    }, 30000)

    return notification
  }

  cancelNotification(notificationId) {
    const timeoutId = this.activeNotifications.get(notificationId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.activeNotifications.delete(notificationId)
      console.log(`Notification ${notificationId} cancelled`)
      return true
    }
    return false
  }

  cancelAllNotifications() {
    this.activeNotifications.forEach((timeoutId, notificationId) => {
      clearTimeout(timeoutId)
    })
    this.activeNotifications.clear()
    console.log('All notifications cancelled')
  }

  getActionIcon(type) {
    const icons = {
      light: '☀️',
      avoid_light: '🌙',
      sleep: '😴',
      nap: '💤',
      meal: '🍽️',
      hydrate: '💧',
      melatonin: '💊',
      caffeine: '☕',
      activity: '🏃',
      repeat: '🔄'
    }
    return icons[type] || '📋'
  }

  getPlanRoute(planType, actionId) {
    // This would need to be implemented based on your routing structure
    // For now, return a generic route
    switch (planType) {
      case 'trip':
        return '/trips' // User would need to navigate to specific trip
      case 'shift_work':
        return '/trips' // User would need to navigate to specific shift work plan
      case 'sleep_schedule':
        return '/trips' // User would need to navigate to specific sleep schedule plan
      default:
        return '/trips'
    }
  }

  async schedulePlanReminders(plan) {
    if (!this.isEnabled) {
      return []
    }

    const scheduledNotifications = []

    // Check if plan has schedule data
    if (plan.data && plan.data.schedule && plan.data.schedule.phases) {
      plan.data.schedule.phases.forEach(phase => {
        phase.actions?.forEach(action => {
          // Schedule notifications for high priority actions, sleep, and melatonin
          if (action.priority === 'high' || action.type === 'melatonin' || action.type === 'sleep') {
            const notificationId = this.scheduleNotification(
              action, 
              plan.title, 
              plan.type
            )
            if (notificationId) {
              scheduledNotifications.push({
                notificationId,
                actionId: action.action_id,
                planId: plan.id,
                planType: plan.type,
                scheduledTime: action.when_local
              })
            }
          }
        })
      })
    }

    return scheduledNotifications
  }

  scheduleAllReminders(plans) {
    if (!this.isEnabled) {
      return []
    }

    const scheduledNotifications = []

    plans.forEach(plan => {
      const planNotifications = this.schedulePlanReminders(plan)
      scheduledNotifications.push(...planNotifications)
    })

    return scheduledNotifications
  }

  getStatus() {
    return {
      isEnabled: this.isEnabled,
      permission: this.permission,
      activeCount: this.activeNotifications.size,
      supported: 'Notification' in window
    }
  }
}

// Create a singleton instance
export const notificationService = new NotificationService()
