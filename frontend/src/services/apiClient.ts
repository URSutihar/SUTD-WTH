import localforage from 'localforage'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async getAuthToken(): Promise<string | null> {
    return await localforage.getItem<string>('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  // Authentication
  async authenticateWithGoogle(code: string) {
    return this.request('/api/v1/auth/google', {
      method: 'POST',
      body: JSON.stringify({ code }),
    })
  }

  async getUser() {
    return this.request('/api/v1/user')
  }

  // Trips
  async getTrips() {
    return this.request('/api/v1/trips')
  }

  async getTrip(tripId: string) {
    return this.request(`/api/v1/trips/${tripId}`)
  }

  async createTrip(tripData: any) {
    return this.request('/api/v1/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
  }

  async updateTrip(tripId: string, updates: any) {
    return this.request(`/api/v1/trips/${tripId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteTrip(tripId: string) {
    return this.request(`/api/v1/trips/${tripId}`, {
      method: 'DELETE',
    })
  }

  // Plans
  async generatePlan(tripId: string, forceRegenerate = false) {
    return this.request(`/api/v1/plans/trips/${tripId}/generate-plan`, {
      method: 'POST',
      body: JSON.stringify({ force_regenerate: forceRegenerate }),
    })
  }

  async getPlan(tripId: string) {
    return this.request(`/api/v1/plans/trips/${tripId}/plan`)
  }

  // Notifications
  async subscribeToNotifications(subscription: any) {
    return this.request('/api/v1/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    })
  }

  async getNotifications() {
    return this.request('/api/v1/notifications')
  }

  async createNotification(notificationData: any) {
    return this.request('/api/v1/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    })
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/api/v1/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  }

  // Wearables
  async sendWearableData(data: any) {
    return this.request('/api/v1/wearable/webhook', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getWearableData(limit = 100, offset = 0) {
    return this.request(`/api/v1/wearable?limit=${limit}&offset=${offset}`)
  }

  async getWearableSummary(days = 7) {
    return this.request(`/api/v1/wearable/summary?days=${days}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)
