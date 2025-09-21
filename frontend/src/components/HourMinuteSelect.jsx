import { useState, useEffect } from 'react'

export const HourMinuteSelect = ({ 
  value, 
  onChange, 
  name,
  id,
  required = false,
  className = ""
}) => {
  const [hour, setHour] = useState('')
  const [minute, setMinute] = useState('')

  // Generate hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i.toString().padStart(2, '0'),
    label: i.toString().padStart(2, '0')
  }))

  // Generate minute options (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
    value: (i * 5).toString().padStart(2, '0'),
    label: (i * 5).toString().padStart(2, '0')
  }))

  // Update local state when value prop changes
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':')
      setHour(h)
      setMinute(m)
    } else {
      setHour('')
      setMinute('')
    }
  }, [value])

  // Handle hour change
  const handleHourChange = (e) => {
    const newHour = e.target.value
    setHour(newHour)
    const timeValue = newHour && minute ? `${newHour}:${minute}` : ''
    onChange({ target: { name, value: timeValue } })
  }

  // Handle minute change
  const handleMinuteChange = (e) => {
    const newMinute = e.target.value
    setMinute(newMinute)
    const timeValue = hour && newMinute ? `${hour}:${newMinute}` : ''
    onChange({ target: { name, value: timeValue } })
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1">
        <select
          value={hour}
          onChange={handleHourChange}
          required={required}
          className="mt-1 input-field"
        >
          <option value="">Hour</option>
          {hourOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1">
        <select
          value={minute}
          onChange={handleMinuteChange}
          required={required}
          className="mt-1 input-field"
        >
          <option value="">Min</option>
          {minuteOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

