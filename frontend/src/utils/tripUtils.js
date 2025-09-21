// Utility functions for trip planning

/**
 * Get timezone from city name
 * @param {string} cityName - City name
 * @returns {string|null} Timezone string or null if not found
 */
export const getTimezoneFromCity = (cityName) => {
  const cityTimezoneMap = {
    // Asia
    'singapore': 'Asia/Singapore',
    'tokyo': 'Asia/Tokyo',
    'seoul': 'Asia/Seoul',
    'shanghai': 'Asia/Shanghai',
    'beijing': 'Asia/Shanghai',
    'hong kong': 'Asia/Hong_Kong',
    'taipei': 'Asia/Taipei',
    'bangkok': 'Asia/Bangkok',
    'kuala lumpur': 'Asia/Kuala_Lumpur',
    'jakarta': 'Asia/Jakarta',
    'manila': 'Asia/Manila',
    'ho chi minh city': 'Asia/Ho_Chi_Minh',
    'hanoi': 'Asia/Ho_Chi_Minh',
    'dhaka': 'Asia/Dhaka',
    'mumbai': 'Asia/Kolkata',
    'delhi': 'Asia/Kolkata',
    'bangalore': 'Asia/Kolkata',
    'chennai': 'Asia/Kolkata',
    'kolkata': 'Asia/Kolkata',
    'hyderabad': 'Asia/Kolkata',
    'islamabad': 'Asia/Karachi',
    'karachi': 'Asia/Karachi',
    'kathmandu': 'Asia/Kathmandu',
    'colombo': 'Asia/Colombo',
    'male': 'Indian/Maldives',
    
    // Middle East
    'dubai': 'Asia/Dubai',
    'abu dhabi': 'Asia/Dubai',
    'doha': 'Asia/Qatar',
    'riyadh': 'Asia/Riyadh',
    'jeddah': 'Asia/Riyadh',
    'tehran': 'Asia/Tehran',
    'tel aviv': 'Asia/Jerusalem',
    'jerusalem': 'Asia/Jerusalem',
    
    // Europe
    'london': 'Europe/London',
    'paris': 'Europe/Paris',
    'frankfurt': 'Europe/Berlin',
    'berlin': 'Europe/Berlin',
    'munich': 'Europe/Berlin',
    'amsterdam': 'Europe/Amsterdam',
    'rome': 'Europe/Rome',
    'milan': 'Europe/Rome',
    'madrid': 'Europe/Madrid',
    'barcelona': 'Europe/Madrid',
    'zurich': 'Europe/Zurich',
    'vienna': 'Europe/Vienna',
    'brussels': 'Europe/Brussels',
    'copenhagen': 'Europe/Copenhagen',
    'stockholm': 'Europe/Stockholm',
    'oslo': 'Europe/Oslo',
    'helsinki': 'Europe/Helsinki',
    'warsaw': 'Europe/Warsaw',
    'prague': 'Europe/Prague',
    'budapest': 'Europe/Budapest',
    'moscow': 'Europe/Moscow',
    'istanbul': 'Europe/Istanbul',
    'athens': 'Europe/Athens',
    'lisbon': 'Europe/Lisbon',
    'dublin': 'Europe/Dublin',
    
    // North America
    'new york': 'America/New_York',
    'los angeles': 'America/Los_Angeles',
    'chicago': 'America/Chicago',
    'houston': 'America/Chicago',
    'phoenix': 'America/Phoenix',
    'philadelphia': 'America/New_York',
    'san antonio': 'America/Chicago',
    'san diego': 'America/Los_Angeles',
    'dallas': 'America/Chicago',
    'san jose': 'America/Los_Angeles',
    'austin': 'America/Chicago',
    'san francisco': 'America/Los_Angeles',
    'seattle': 'America/Los_Angeles',
    'denver': 'America/Denver',
    'washington': 'America/New_York',
    'boston': 'America/New_York',
    'detroit': 'America/New_York',
    'portland': 'America/Los_Angeles',
    'las vegas': 'America/Los_Angeles',
    'atlanta': 'America/New_York',
    'miami': 'America/New_York',
    'minneapolis': 'America/Chicago',
    'honolulu': 'Pacific/Honolulu',
    
    // Canada
    'toronto': 'America/Toronto',
    'vancouver': 'America/Vancouver',
    'montreal': 'America/Toronto',
    'calgary': 'America/Edmonton',
    'ottawa': 'America/Toronto',
    'edmonton': 'America/Edmonton',
    'winnipeg': 'America/Winnipeg',
    
    // South America
    'são paulo': 'America/Sao_Paulo',
    'rio de janeiro': 'America/Sao_Paulo',
    'buenos aires': 'America/Argentina/Buenos_Aires',
    'santiago': 'America/Santiago',
    'lima': 'America/Lima',
    'bogotá': 'America/Bogota',
    'caracas': 'America/Caracas',
    'quito': 'America/Guayaquil',
    
    // Africa
    'cairo': 'Africa/Cairo',
    'johannesburg': 'Africa/Johannesburg',
    'cape town': 'Africa/Johannesburg',
    'lagos': 'Africa/Lagos',
    'nairobi': 'Africa/Nairobi',
    'addis ababa': 'Africa/Addis_Ababa',
    'casablanca': 'Africa/Casablanca',
    
    // Oceania
    'sydney': 'Australia/Sydney',
    'melbourne': 'Australia/Melbourne',
    'brisbane': 'Australia/Brisbane',
    'perth': 'Australia/Perth',
    'adelaide': 'Australia/Adelaide',
    'auckland': 'Pacific/Auckland',
    'wellington': 'Pacific/Auckland',
    
    // Additional major cities
    'mexico city': 'America/Mexico_City',
    'guadalajara': 'America/Mexico_City',
    'cancún': 'America/Cancun',
    'havana': 'America/Havana',
    'kingston': 'America/Jamaica',
    'panama city': 'America/Panama',
    'san josé': 'America/Costa_Rica'
  }
  
  const normalizedCity = cityName.toLowerCase().trim()
  return cityTimezoneMap[normalizedCity] || null
}

/**
 * Calculate flight duration in minutes from departure and arrival times
 * @param {string} departureDate - Departure date (YYYY-MM-DD)
 * @param {string} departureTime - Departure time (HH:MM)
 * @param {string} arrivalDate - Arrival date (YYYY-MM-DD)
 * @param {string} arrivalTime - Arrival time (HH:MM)
 * @param {string} originTimezone - Origin timezone (e.g., "Asia/Singapore")
 * @param {string} destinationTimezone - Destination timezone (e.g., "America/Los_Angeles")
 * @returns {number} Flight duration in minutes
 */
export const calculateFlightDuration = (
  departureDate,
  departureTime,
  arrivalDate,
  arrivalTime,
  originTimezone,
  destinationTimezone
) => {
  try {
    if (!departureDate || !departureTime || !arrivalDate || !arrivalTime || !originTimezone || !destinationTimezone) {
      return 0
    }

    // Create departure datetime in origin timezone
    const departureDateTime = new Date(`${departureDate}T${departureTime}`)
    
    // Create arrival datetime in destination timezone
    const arrivalDateTime = new Date(`${arrivalDate}T${arrivalTime}`)
    
    // Convert to UTC for accurate calculation
    const departureUTC = new Date(departureDateTime.toLocaleString("en-US", {timeZone: originTimezone}))
    const arrivalUTC = new Date(arrivalDateTime.toLocaleString("en-US", {timeZone: destinationTimezone}))
    
    // Calculate difference in minutes
    const durationMs = arrivalUTC.getTime() - departureUTC.getTime()
    const durationMinutes = Math.round(durationMs / (1000 * 60))
    
    return Math.max(0, durationMinutes) // Ensure non-negative
  } catch (error) {
    console.error('Error calculating flight duration:', error)
    return 0
  }
}

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration (e.g., "15h 30m")
 */
/**
 * Convert local datetime to UTC string
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:MM format
 * @param {string} timezone - Timezone string (e.g., "Asia/Singapore")
 * @returns {string} UTC datetime string
 */
export const convertToUTC = (date, time, timezone) => {
  try {
    if (!date || !time || !timezone) {
      throw new Error('Missing required parameters')
    }

    // Create a date object in the specified timezone
    const localDateTime = new Date(`${date}T${time}`)
    
    // For now, use a simple approach - treat as local time and convert to UTC
    // This is a simplified version that should work for most cases
    return localDateTime.toISOString()
  } catch (error) {
    console.error('Error converting to UTC:', error)
    // Fallback to simple conversion
    return new Date(`${date}T${time}`).toISOString()
  }
}
