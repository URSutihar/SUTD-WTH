import { useState, useEffect, useRef } from 'react'

export const CityAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Enter city name...", 
  className = "",
  required = false,
  id = ""
}) => {
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef(null)

  // Comprehensive city database with timezone information
  const cities = [
    // Asia
    { name: "Singapore", country: "Singapore", timezone: "Asia/Singapore", code: "SIN" },
    { name: "Tokyo", country: "Japan", timezone: "Asia/Tokyo", code: "NRT" },
    { name: "Seoul", country: "South Korea", timezone: "Asia/Seoul", code: "ICN" },
    { name: "Shanghai", country: "China", timezone: "Asia/Shanghai", code: "PVG" },
    { name: "Beijing", country: "China", timezone: "Asia/Shanghai", code: "PEK" },
    { name: "Hong Kong", country: "Hong Kong", timezone: "Asia/Hong_Kong", code: "HKG" },
    { name: "Taipei", country: "Taiwan", timezone: "Asia/Taipei", code: "TPE" },
    { name: "Bangkok", country: "Thailand", timezone: "Asia/Bangkok", code: "BKK" },
    { name: "Kuala Lumpur", country: "Malaysia", timezone: "Asia/Kuala_Lumpur", code: "KUL" },
    { name: "Jakarta", country: "Indonesia", timezone: "Asia/Jakarta", code: "CGK" },
    { name: "Manila", country: "Philippines", timezone: "Asia/Manila", code: "MNL" },
    { name: "Ho Chi Minh City", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", code: "SGN" },
    { name: "Hanoi", country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", code: "HAN" },
    { name: "Dhaka", country: "Bangladesh", timezone: "Asia/Dhaka", code: "DAC" },
    { name: "Mumbai", country: "India", timezone: "Asia/Kolkata", code: "BOM" },
    { name: "Delhi", country: "India", timezone: "Asia/Kolkata", code: "DEL" },
    { name: "Bangalore", country: "India", timezone: "Asia/Kolkata", code: "BLR" },
    { name: "Chennai", country: "India", timezone: "Asia/Kolkata", code: "MAA" },
    { name: "Kolkata", country: "India", timezone: "Asia/Kolkata", code: "CCU" },
    { name: "Hyderabad", country: "India", timezone: "Asia/Kolkata", code: "HYD" },
    { name: "Islamabad", country: "Pakistan", timezone: "Asia/Karachi", code: "ISB" },
    { name: "Karachi", country: "Pakistan", timezone: "Asia/Karachi", code: "KHI" },
    { name: "Kathmandu", country: "Nepal", timezone: "Asia/Kathmandu", code: "KTM" },
    { name: "Colombo", country: "Sri Lanka", timezone: "Asia/Colombo", code: "CMB" },
    { name: "Male", country: "Maldives", timezone: "Indian/Maldives", code: "MLE" },
    
    // Middle East
    { name: "Dubai", country: "United Arab Emirates", timezone: "Asia/Dubai", code: "DXB" },
    { name: "Abu Dhabi", country: "United Arab Emirates", timezone: "Asia/Dubai", code: "AUH" },
    { name: "Doha", country: "Qatar", timezone: "Asia/Qatar", code: "DOH" },
    { name: "Riyadh", country: "Saudi Arabia", timezone: "Asia/Riyadh", code: "RUH" },
    { name: "Jeddah", country: "Saudi Arabia", timezone: "Asia/Riyadh", code: "JED" },
    { name: "Tehran", country: "Iran", timezone: "Asia/Tehran", code: "IKA" },
    { name: "Tel Aviv", country: "Israel", timezone: "Asia/Jerusalem", code: "TLV" },
    { name: "Jerusalem", country: "Israel", timezone: "Asia/Jerusalem", code: "JRS" },
    
    // Europe
    { name: "London", country: "United Kingdom", timezone: "Europe/London", code: "LHR" },
    { name: "Paris", country: "France", timezone: "Europe/Paris", code: "CDG" },
    { name: "Frankfurt", country: "Germany", timezone: "Europe/Berlin", code: "FRA" },
    { name: "Berlin", country: "Germany", timezone: "Europe/Berlin", code: "BER" },
    { name: "Munich", country: "Germany", timezone: "Europe/Berlin", code: "MUC" },
    { name: "Amsterdam", country: "Netherlands", timezone: "Europe/Amsterdam", code: "AMS" },
    { name: "Rome", country: "Italy", timezone: "Europe/Rome", code: "FCO" },
    { name: "Milan", country: "Italy", timezone: "Europe/Rome", code: "MXP" },
    { name: "Madrid", country: "Spain", timezone: "Europe/Madrid", code: "MAD" },
    { name: "Barcelona", country: "Spain", timezone: "Europe/Madrid", code: "BCN" },
    { name: "Zurich", country: "Switzerland", timezone: "Europe/Zurich", code: "ZUR" },
    { name: "Vienna", country: "Austria", timezone: "Europe/Vienna", code: "VIE" },
    { name: "Brussels", country: "Belgium", timezone: "Europe/Brussels", code: "BRU" },
    { name: "Copenhagen", country: "Denmark", timezone: "Europe/Copenhagen", code: "CPH" },
    { name: "Stockholm", country: "Sweden", timezone: "Europe/Stockholm", code: "ARN" },
    { name: "Oslo", country: "Norway", timezone: "Europe/Oslo", code: "OSL" },
    { name: "Helsinki", country: "Finland", timezone: "Europe/Helsinki", code: "HEL" },
    { name: "Warsaw", country: "Poland", timezone: "Europe/Warsaw", code: "WAW" },
    { name: "Prague", country: "Czech Republic", timezone: "Europe/Prague", code: "PRG" },
    { name: "Budapest", country: "Hungary", timezone: "Europe/Budapest", code: "BUD" },
    { name: "Moscow", country: "Russia", timezone: "Europe/Moscow", code: "SVO" },
    { name: "Istanbul", country: "Turkey", timezone: "Europe/Istanbul", code: "IST" },
    { name: "Athens", country: "Greece", timezone: "Europe/Athens", code: "ATH" },
    { name: "Lisbon", country: "Portugal", timezone: "Europe/Lisbon", code: "LIS" },
    { name: "Dublin", country: "Ireland", timezone: "Europe/Dublin", code: "DUB" },
    
    // North America
    { name: "New York", country: "United States", timezone: "America/New_York", code: "JFK" },
    { name: "Los Angeles", country: "United States", timezone: "America/Los_Angeles", code: "LAX" },
    { name: "Chicago", country: "United States", timezone: "America/Chicago", code: "ORD" },
    { name: "Houston", country: "United States", timezone: "America/Chicago", code: "IAH" },
    { name: "Phoenix", country: "United States", timezone: "America/Phoenix", code: "PHX" },
    { name: "Philadelphia", country: "United States", timezone: "America/New_York", code: "PHL" },
    { name: "San Antonio", country: "United States", timezone: "America/Chicago", code: "SAT" },
    { name: "San Diego", country: "United States", timezone: "America/Los_Angeles", code: "SAN" },
    { name: "Dallas", country: "United States", timezone: "America/Chicago", code: "DFW" },
    { name: "San Jose", country: "United States", timezone: "America/Los_Angeles", code: "SJC" },
    { name: "Austin", country: "United States", timezone: "America/Chicago", code: "AUS" },
    { name: "San Francisco", country: "United States", timezone: "America/Los_Angeles", code: "SFO" },
    { name: "Seattle", country: "United States", timezone: "America/Los_Angeles", code: "SEA" },
    { name: "Denver", country: "United States", timezone: "America/Denver", code: "DEN" },
    { name: "Washington", country: "United States", timezone: "America/New_York", code: "DCA" },
    { name: "Boston", country: "United States", timezone: "America/New_York", code: "BOS" },
    { name: "Detroit", country: "United States", timezone: "America/New_York", code: "DTW" },
    { name: "Portland", country: "United States", timezone: "America/Los_Angeles", code: "PDX" },
    { name: "Las Vegas", country: "United States", timezone: "America/Los_Angeles", code: "LAS" },
    { name: "Atlanta", country: "United States", timezone: "America/New_York", code: "ATL" },
    { name: "Miami", country: "United States", timezone: "America/New_York", code: "MIA" },
    { name: "Minneapolis", country: "United States", timezone: "America/Chicago", code: "MSP" },
    { name: "Honolulu", country: "United States", timezone: "Pacific/Honolulu", code: "HNL" },
    
    // Canada
    { name: "Toronto", country: "Canada", timezone: "America/Toronto", code: "YYZ" },
    { name: "Vancouver", country: "Canada", timezone: "America/Vancouver", code: "YVR" },
    { name: "Montreal", country: "Canada", timezone: "America/Toronto", code: "YUL" },
    { name: "Calgary", country: "Canada", timezone: "America/Edmonton", code: "YYC" },
    { name: "Ottawa", country: "Canada", timezone: "America/Toronto", code: "YOW" },
    { name: "Edmonton", country: "Canada", timezone: "America/Edmonton", code: "YEG" },
    { name: "Winnipeg", country: "Canada", timezone: "America/Winnipeg", code: "YWG" },
    
    // South America
    { name: "São Paulo", country: "Brazil", timezone: "America/Sao_Paulo", code: "GRU" },
    { name: "Rio de Janeiro", country: "Brazil", timezone: "America/Sao_Paulo", code: "GIG" },
    { name: "Buenos Aires", country: "Argentina", timezone: "America/Argentina/Buenos_Aires", code: "EZE" },
    { name: "Santiago", country: "Chile", timezone: "America/Santiago", code: "SCL" },
    { name: "Lima", country: "Peru", timezone: "America/Lima", code: "LIM" },
    { name: "Bogotá", country: "Colombia", timezone: "America/Bogota", code: "BOG" },
    { name: "Caracas", country: "Venezuela", timezone: "America/Caracas", code: "CCS" },
    { name: "Quito", country: "Ecuador", timezone: "America/Guayaquil", code: "UIO" },
    
    // Africa
    { name: "Cairo", country: "Egypt", timezone: "Africa/Cairo", code: "CAI" },
    { name: "Johannesburg", country: "South Africa", timezone: "Africa/Johannesburg", code: "JNB" },
    { name: "Cape Town", country: "South Africa", timezone: "Africa/Johannesburg", code: "CPT" },
    { name: "Lagos", country: "Nigeria", timezone: "Africa/Lagos", code: "LOS" },
    { name: "Nairobi", country: "Kenya", timezone: "Africa/Nairobi", code: "NBO" },
    { name: "Addis Ababa", country: "Ethiopia", timezone: "Africa/Addis_Ababa", code: "ADD" },
    { name: "Casablanca", country: "Morocco", timezone: "Africa/Casablanca", code: "CMN" },
    
    // Oceania
    { name: "Sydney", country: "Australia", timezone: "Australia/Sydney", code: "SYD" },
    { name: "Melbourne", country: "Australia", timezone: "Australia/Melbourne", code: "MEL" },
    { name: "Brisbane", country: "Australia", timezone: "Australia/Brisbane", code: "BNE" },
    { name: "Perth", country: "Australia", timezone: "Australia/Perth", code: "PER" },
    { name: "Adelaide", country: "Australia", timezone: "Australia/Adelaide", code: "ADL" },
    { name: "Auckland", country: "New Zealand", timezone: "Pacific/Auckland", code: "AKL" },
    { name: "Wellington", country: "New Zealand", timezone: "Pacific/Auckland", code: "WLG" },
    
    // Additional major cities
    { name: "Mexico City", country: "Mexico", timezone: "America/Mexico_City", code: "MEX" },
    { name: "Guadalajara", country: "Mexico", timezone: "America/Mexico_City", code: "GDL" },
    { name: "Cancún", country: "Mexico", timezone: "America/Cancun", code: "CUN" },
    { name: "Havana", country: "Cuba", timezone: "America/Havana", code: "HAV" },
    { name: "Kingston", country: "Jamaica", timezone: "America/Jamaica", code: "KIN" },
    { name: "Panama City", country: "Panama", timezone: "America/Panama", code: "PTY" },
    { name: "San José", country: "Costa Rica", timezone: "America/Costa_Rica", code: "SJO" }
  ]

  // Efficient search function
  const searchCities = (query) => {
    if (!query || query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const filteredCities = cities.filter(city =>
      city.name.toLowerCase().includes(query.toLowerCase()) ||
      city.country.toLowerCase().includes(query.toLowerCase()) ||
      city.code.toLowerCase().includes(query.toLowerCase())
    )
    
    setSuggestions(filteredCities.slice(0, 8)) // Limit to 8 suggestions
    setShowSuggestions(true)
  }

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchCities(value)
    }, 200)

    return () => clearTimeout(timeoutId)
  }, [value])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    onChange(newValue)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (city) => {
    onChange(city.name)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    setSuggestions([])
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex])
        }
        setSuggestions([])
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        setSuggestions([])
        break
    }
  }

  const handleBlur = (e) => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedIndex(-1)
      setSuggestions([])
    }, 200)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => value && value.length >= 2 && setShowSuggestions(true)}
          className={`input-field ${className}`}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((city, index) => (
            <div
              key={`${city.name}-${city.country}`}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex
                  ? 'bg-jetlag-50 text-jetlag-700'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleSuggestionClick(city)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{city.name}</div>
                  <div className="text-sm text-gray-500">{city.country}</div>
                </div>
                <div className="text-sm text-gray-400">{city.code}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

