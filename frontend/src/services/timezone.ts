import { format, parseISO, zonedTimeToUtc, utcToZonedTime } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

export interface TimezoneInfo {
  timezone: string
  offset: string
  name: string
  abbreviation: string
}

export class TimezoneService {
  private static commonTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Singapore',
    'Asia/Dubai',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland',
    'UTC'
  ]

  static getTimezoneInfo(timezone: string): TimezoneInfo {
    const now = new Date()
    const offset = this.getTimezoneOffset(timezone)
    const abbreviation = this.getTimezoneAbbreviation(timezone, now)
    
    return {
      timezone,
      offset,
      name: this.getTimezoneDisplayName(timezone),
      abbreviation
    }
  }

  static getTimezoneOffset(timezone: string): string {
    const now = new Date()
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    const offsetMs = targetTime.getTime() - utc.getTime()
    const offsetHours = offsetMs / (1000 * 60 * 60)
    
    const sign = offsetHours >= 0 ? '+' : '-'
    const hours = Math.abs(Math.floor(offsetHours))
    const minutes = Math.abs((offsetHours % 1) * 60)
    
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }

  static getTimezoneAbbreviation(timezone: string, date: Date): string {
    try {
      const formatter = new Intl.DateTimeFormat('en', {
        timeZone: timezone,
        timeZoneName: 'short'
      })
      const parts = formatter.formatToParts(date)
      const timeZoneName = parts.find(part => part.type === 'timeZoneName')
      return timeZoneName?.value || 'UTC'
    } catch {
      return 'UTC'
    }
  }

  static getTimezoneDisplayName(timezone: string): string {
    const parts = timezone.split('/')
    if (parts.length === 2) {
      const city = parts[1].replace(/_/g, ' ')
      const region = parts[0].replace(/_/g, ' ')
      return `${city}, ${region}`
    }
    return timezone
  }

  static getCommonTimezones(): TimezoneInfo[] {
    return this.commonTimezones.map(tz => this.getTimezoneInfo(tz))
  }

  static searchTimezones(query: string): TimezoneInfo[] {
    const allTimezones = Intl.supportedValuesOf('timeZone')
    const filtered = allTimezones.filter(tz => 
      tz.toLowerCase().includes(query.toLowerCase())
    )
    
    return filtered.slice(0, 20).map(tz => this.getTimezoneInfo(tz))
  }

  static convertTime(
    dateTime: string | Date,
    fromTimezone: string,
    toTimezone: string
  ): Date {
    const date = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime
    const utcDate = zonedTimeToUtc(date, fromTimezone)
    return utcToZonedTime(utcDate, toTimezone)
  }

  static formatTimeInTimezone(
    dateTime: string | Date,
    timezone: string,
    formatString: string = 'yyyy-MM-dd HH:mm'
  ): string {
    return formatInTimeZone(dateTime, timezone, formatString)
  }

  static getCurrentTimeInTimezone(timezone: string): string {
    return this.formatTimeInTimezone(new Date(), timezone, 'HH:mm')
  }

  static calculateTimeDifference(timezone1: string, timezone2: string): number {
    const now = new Date()
    const time1 = new Date(now.toLocaleString('en-US', { timeZone: timezone1 }))
    const time2 = new Date(now.toLocaleString('en-US', { timeZone: timezone2 }))
    
    return time1.getTime() - time2.getTime()
  }

  static getTimeDifferenceInHours(timezone1: string, timezone2: string): number {
    const diffMs = this.calculateTimeDifference(timezone1, timezone2)
    return diffMs / (1000 * 60 * 60)
  }

  static isDSTActive(timezone: string, date: Date = new Date()): boolean {
    const jan = new Date(date.getFullYear(), 0, 1)
    const jul = new Date(date.getFullYear(), 6, 1)
    
    const janOffset = this.getTimezoneOffsetMs(timezone, jan)
    const julOffset = this.getTimezoneOffsetMs(timezone, jul)
    
    return Math.max(janOffset, julOffset) !== Math.min(janOffset, julOffset)
  }

  private static getTimezoneOffsetMs(timezone: string, date: Date): number {
    const utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000))
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }))
    return targetTime.getTime() - utc.getTime()
  }
}
