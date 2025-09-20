import { format, parseISO, addDays, subDays, isAfter, isBefore } from 'date-fns'
import { formatInTimeZone, zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz'

export interface TimezoneInfo {
  timezone: string
  offset: string
  name: string
  abbreviation: string
}

export class TimeUtils {
  /**
   * Format a date in a specific timezone
   */
  static formatInTimezone(
    date: string | Date,
    timezone: string,
    formatString: string = 'yyyy-MM-dd HH:mm'
  ): string {
    return formatInTimeZone(date, timezone, formatString)
  }

  /**
   * Convert time from one timezone to another
   */
  static convertTimezone(
    dateTime: string | Date,
    fromTimezone: string,
    toTimezone: string
  ): Date {
    const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
    const utcDate = zonedTimeToUtc(date, fromTimezone)
    return utcToZonedTime(utcDate, toTimezone)
  }

  /**
   * Get current time in a specific timezone
   */
  static getCurrentTimeInTimezone(timezone: string): string {
    return this.formatInTimezone(new Date(), timezone, 'HH:mm')
  }

  /**
   * Calculate time difference between two timezones in hours
   */
  static getTimezoneDifference(timezone1: string, timezone2: string): number {
    const now = new Date()
    const time1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }))
    const time2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }))
    
    return (time1.getTime() - time2.getTime()) / (1000 * 60 * 60)
  }

  /**
   * Check if a time is within a specific range
   */
  static isTimeInRange(
    time: string,
    startTime: string,
    endTime: string
  ): boolean {
    const [timeHours, timeMinutes] = time.split(':').map(Number)
    const [startHours, startMinutes] = startTime.split(':').map(Number)
    const [endHours, endMinutes] = endTime.split(':').map(Number)

    const timeMinutesTotal = timeHours * 60 + timeMinutes
    const startMinutesTotal = startHours * 60 + startMinutes
    const endMinutesTotal = endHours * 60 + endMinutes

    return timeMinutesTotal >= startMinutesTotal && timeMinutesTotal <= endMinutesTotal
  }

  /**
   * Add minutes to a time string
   */
  static addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number)
    const totalMinutes = hours * 60 + mins + minutes
    const newHours = Math.floor(totalMinutes / 60) % 24
    const newMins = totalMinutes % 60

    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`
  }

  /**
   * Get time until a specific time
   */
  static getTimeUntil(targetTime: string, currentTime?: string): string {
    const now = currentTime || this.getCurrentTimeInTimezone('UTC')
    const [targetHours, targetMinutes] = targetTime.split(':').map(Number)
    const [currentHours, currentMinutes] = now.split(':').map(Number)

    const targetTotal = targetHours * 60 + targetMinutes
    const currentTotal = currentHours * 60 + currentMinutes

    let diffMinutes = targetTotal - currentTotal
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60 // Add 24 hours if target is next day
    }

    const hours = Math.floor(diffMinutes / 60)
    const minutes = diffMinutes % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  /**
   * Check if it's currently daytime in a timezone
   */
  static isDaytime(timezone: string): boolean {
    const now = new Date()
    const localTime = utcToZonedTime(now, timezone)
    const hour = localTime.getHours()
    
    return hour >= 6 && hour < 18
  }

  /**
   * Get sunrise and sunset times for a timezone (approximate)
   */
  static getSunriseSunset(timezone: string): { sunrise: string; sunset: string } {
    // This is a simplified calculation - in production, you'd use a proper sun calculation library
    return {
      sunrise: '06:00',
      sunset: '18:00'
    }
  }

  /**
   * Check if DST is active in a timezone
   */
  static isDSTActive(timezone: string, date: Date = new Date()): boolean {
    const jan = new Date(date.getFullYear(), 0, 1)
    const jul = new Date(date.getFullYear(), 6, 1)
    
    const janOffset = this.getTimezoneOffset(timezone, jan)
    const julOffset = this.getTimezoneOffset(timezone, jul)
    
    return Math.max(janOffset, julOffset) !== Math.min(janOffset, julOffset)
  }

  private static getTimezoneOffset(timezone: string, date: Date): number {
    const utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    return targetTime.getTime() - utc.getTime()
  }

  /**
   * Format duration in a human-readable way
   */
  static formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60

    if (hours > 0) {
      return `${hours}h ${mins}m`
    } else {
      return `${mins}m`
    }
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 30 minutes")
   */
  static getRelativeTime(date: string | Date): string {
    const now = new Date()
    const target = typeof date === 'string' ? parseISO(date) : date
    const diffMs = target.getTime() - now.getTime()
    const diffMinutes = Math.round(diffMs / (1000 * 60))

    if (Math.abs(diffMinutes) < 1) {
      return 'now'
    } else if (diffMinutes > 0) {
      if (diffMinutes < 60) {
        return `in ${diffMinutes}m`
      } else {
        const hours = Math.floor(diffMinutes / 60)
        const mins = diffMinutes % 60
        return `in ${hours}h ${mins}m`
      }
    } else {
      const absMinutes = Math.abs(diffMinutes)
      if (absMinutes < 60) {
        return `${absMinutes}m ago`
      } else {
        const hours = Math.floor(absMinutes / 60)
        const mins = absMinutes % 60
        return `${hours}h ${mins}m ago`
      }
    }
  }
}
