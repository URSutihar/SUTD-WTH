import { useState, useEffect } from 'react'
import { apiClient } from '../lib/api'

export const WeatherWidget = ({ destination }) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        const weatherData = await apiClient.getWeatherByCity(destination)
        setWeather(weatherData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (destination) {
      fetchWeather()
    }
  }, [destination])

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-red-600">Unable to load weather data</span>
        </div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  const getWeatherIcon = (condition) => {
    const icons = {
      'sunny': '☀️',
      'clear': '☀️',
      'partly-cloudy': '⛅',
      'cloudy': '☁️',
      'overcast': '☁️',
      'rainy': '🌧️',
      'stormy': '⛈️',
      'snowy': '❄️',
      'foggy': '🌫️'
    }
    
    const conditionLower = condition?.toLowerCase() || ''
    if (conditionLower.includes('sun') || conditionLower.includes('clear')) return icons.sunny
    if (conditionLower.includes('partly') || conditionLower.includes('few')) return icons['partly-cloudy']
    if (conditionLower.includes('cloud')) return icons.cloudy
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return icons.rainy
    if (conditionLower.includes('storm') || conditionLower.includes('thunder')) return icons.stormy
    if (conditionLower.includes('snow')) return icons.snowy
    if (conditionLower.includes('fog') || conditionLower.includes('mist')) return icons.foggy
    
    return '🌤️'
  }

  const getSunriseSunsetTimes = () => {
    if (!weather.sunrise || !weather.sunset) return null
    
    return {
      sunrise: new Date(weather.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(weather.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const sunTimes = getSunriseSunsetTimes()

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Weather at Destination</h2>
        <span className="text-sm text-gray-500">{destination}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Weather */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">
            {getWeatherIcon(weather.condition)}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {weather.temperature}°{weather.temperature_unit || 'C'}
            </div>
            <div className="text-sm text-gray-500 capitalize">
              {weather.condition}
            </div>
          </div>
        </div>

        {/* Sunrise/Sunset */}
        {sunTimes && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-500">🌅</span>
              <span className="text-sm text-gray-600">
                Sunrise: {sunTimes.sunrise}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-orange-500">🌇</span>
              <span className="text-sm text-gray-600">
                Sunset: {sunTimes.sunset}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Additional Weather Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {weather.humidity && (
            <div className="text-center">
              <div className="text-gray-500">Humidity</div>
              <div className="font-medium text-gray-900">{weather.humidity}%</div>
            </div>
          )}
          {weather.wind_speed && (
            <div className="text-center">
              <div className="text-gray-500">Wind</div>
              <div className="font-medium text-gray-900">{weather.wind_speed} {weather.wind_unit || 'km/h'}</div>
            </div>
          )}
          {weather.cloud_cover && (
            <div className="text-center">
              <div className="text-gray-500">Cloud Cover</div>
              <div className="font-medium text-gray-900">{weather.cloud_cover}%</div>
            </div>
          )}
          {weather.uv_index && (
            <div className="text-center">
              <div className="text-gray-500">UV Index</div>
              <div className="font-medium text-gray-900">{weather.uv_index}</div>
            </div>
          )}
        </div>
      </div>

      {/* Light Exposure Recommendation */}
      {sunTimes && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <span className="text-blue-500 mr-2">💡</span>
            <div className="text-sm text-blue-800">
              <strong>Light Exposure Tip:</strong> For optimal circadian adjustment, 
              try to get outdoor light exposure around sunrise ({sunTimes.sunrise}) 
              and avoid bright light before sunset ({sunTimes.sunset}).
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
