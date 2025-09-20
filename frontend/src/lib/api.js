const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // Flight lookup
  async lookupFlight(flightNumber, date = null) {
    const params = new URLSearchParams()
    if (date) params.append('date', date)
    const queryString = params.toString()
    const url = `/api/v1/flight-lookup/${flightNumber}${queryString ? `?${queryString}` : ''}`
    return this.request(url)
  }

  // Trip management
  async createTrip(tripData) {
    return this.request('/api/v1/trips', {
      method: 'POST',
      body: JSON.stringify(tripData),
    })
  }

  async getTrips(userId) {
    return this.request(`/api/v1/trips?user_id=${userId}`)
  }

  async getTrip(tripId) {
    return this.request(`/api/v1/trips/${tripId}`)
  }

  // Plan generation
  async generatePlan(planData) {
    return this.request('/api/v1/generate-plan', {
      method: 'POST',
      body: JSON.stringify(planData),
    })
  }

  // Checklist management
  async markActionComplete(actionId, completed) {
    return this.request('/api/v1/checklist/mark', {
      method: 'POST',
      body: JSON.stringify({ action_id: actionId, completed }),
    })
  }

  // Weather
  async getWeather(lat, lon) {
    return this.request(`/api/v1/weather?lat=${lat}&lon=${lon}`)
  }

  async getWeatherByCity(city) {
    return this.request(`/api/v1/weather?q=${city}`)
  }

  // Health check
  async healthCheck() {
    return this.request('/api/v1/health')
  }
}

export const apiClient = new ApiClient()
