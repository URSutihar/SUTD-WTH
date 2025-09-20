interface WeatherData {
  temperature: number
  feels_like: number
  humidity: number
  description: string
  icon: string
  wind_speed: number
  cloudiness: number
  visibility: number
}

interface WeatherForecast {
  location: {
    lat: number
    lon: number
    name: string
    country: string
  }
  forecasts: Record<string, Array<{
    time: string
    temperature: number
    feels_like: number
    humidity: number
    description: string
    icon: string
    wind_speed: number
    cloudiness: number
  }>>
}

class WeatherService {
  private apiKey: string
  private baseURL: string

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || ''
    this.baseURL = 'https://api.openweathermap.org/data/2.5'
  }

  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    if (!this.apiKey) {
      return this.getMockWeather()
    }

    try {
      const response = await fetch(
        `${this.baseURL}/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`
      )
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        temperature: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        wind_speed: data.wind.speed,
        cloudiness: data.clouds.all,
        visibility: data.visibility / 1000 // Convert to km
      }
    } catch (error) {
      console.error('Failed to fetch weather:', error)
      return this.getMockWeather()
    }
  }

  async getForecast(lat: number, lon: number, days: number = 5): Promise<WeatherForecast | null> {
    if (!this.apiKey) {
      return this.getMockForecast(days)
    }

    try {
      const response = await fetch(
        `${this.baseURL}/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&cnt=${days * 8}`
      )
      
      if (!response.ok) {
        throw new Error(`Weather API error: ${response.status}`)
      }

      const data = await response.json()
      
      // Group forecasts by date
      const forecasts: Record<string, any[]> = {}
      
      data.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0]
        if (!forecasts[date]) {
          forecasts[date] = []
        }
        
        forecasts[date].push({
          time: item.dt_txt,
          temperature: item.main.temp,
          feels_like: item.main.feels_like,
          humidity: item.main.humidity,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          wind_speed: item.wind.speed,
          cloudiness: item.clouds.all
        })
      })

      return {
        location: {
          lat: data.city.coord.lat,
          lon: data.city.coord.lon,
          name: data.city.name,
          country: data.city.country
        },
        forecasts
      }
    } catch (error) {
      console.error('Failed to fetch forecast:', error)
      return this.getMockForecast(days)
    }
  }

  getWeatherIcon(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  getWeatherEmoji(description: string): string {
    const emojiMap: Record<string, string> = {
      'clear sky': '☀️',
      'few clouds': '🌤️',
      'scattered clouds': '⛅',
      'broken clouds': '☁️',
      'shower rain': '🌦️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
      'fog': '🌫️'
    }

    return emojiMap[description] || '🌤️'
  }

  getLightRecommendation(weather: WeatherData): string {
    if (weather.cloudiness < 30) {
      return 'Perfect conditions for outdoor light exposure!'
    } else if (weather.cloudiness < 70) {
      return 'Good conditions for outdoor light exposure.'
    } else {
      return 'Consider using a light therapy device indoors.'
    }
  }

  private getMockWeather(): WeatherData {
    return {
      temperature: 22.5,
      feels_like: 24.0,
      humidity: 65,
      description: 'partly cloudy',
      icon: '02d',
      wind_speed: 3.2,
      cloudiness: 40,
      visibility: 10.0
    }
  }

  private getMockForecast(days: number): WeatherForecast {
    const forecasts: Record<string, any[]> = {}
    const today = new Date()
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      
      forecasts[dateStr] = [
        {
          time: `${dateStr} 06:00:00`,
          temperature: 18.0,
          feels_like: 19.0,
          humidity: 70,
          description: 'clear sky',
          icon: '01d',
          wind_speed: 2.5,
          cloudiness: 10
        },
        {
          time: `${dateStr} 12:00:00`,
          temperature: 25.0,
          feels_like: 26.0,
          humidity: 55,
          description: 'partly cloudy',
          icon: '02d',
          wind_speed: 3.0,
          cloudiness: 30
        },
        {
          time: `${dateStr} 18:00:00`,
          temperature: 20.0,
          feels_like: 21.0,
          humidity: 60,
          description: 'clear sky',
          icon: '01d',
          wind_speed: 2.8,
          cloudiness: 5
        }
      ]
    }

    return {
      location: {
        lat: 0.0,
        lon: 0.0,
        name: 'Mock Location',
        country: 'Mock Country'
      },
      forecasts
    }
  }
}

export const weatherService = new WeatherService()
