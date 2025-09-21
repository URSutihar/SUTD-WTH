import { useState } from 'react'

export const TimeSelect = ({ 
  value, 
  onChange, 
  name,
  id,
  required = false,
  className = ""
}) => {
  // Generate time options with 5-minute intervals
  const generateTimeOptions = () => {
    const options = []
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        options.push(timeString)
      }
    }
    return options
  }

  const timeOptions = generateTimeOptions()

  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className={`mt-1 input-field ${className}`}
    >
      <option value="">Select time</option>
      {timeOptions.map(time => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  )
}

