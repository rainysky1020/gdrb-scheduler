import type { ScheduleEvent, ScheduleFilters } from "@/lib/types"

export interface DateGroup {
  date: string
  dayOfWeek: string
  events: ScheduleEvent[]
}

export interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isWeekend: boolean
  isToday: boolean
}

function timeToMinutes(time: string): number {
  if (time === "종일") return -1
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

export function sortByTime(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((left, right) => {
    const leftMinutes = timeToMinutes(left.time)
    const rightMinutes = timeToMinutes(right.time)

    if (leftMinutes === -1 && rightMinutes !== -1) return -1
    if (leftMinutes !== -1 && rightMinutes === -1) return 1
    if (leftMinutes !== rightMinutes) return leftMinutes - rightMinutes
    return left.title.localeCompare(right.title, "ko")
  })
}

export function groupByDate(events: ScheduleEvent[]): DateGroup[] {
  const groups = new Map<string, DateGroup>()

  for (const event of sortByTime(events)) {
    const existing = groups.get(event.date)
    if (existing) {
      existing.events.push(event)
      continue
    }

    groups.set(event.date, {
      date: event.date,
      dayOfWeek: event.dayOfWeek,
      events: [event],
    })
  }

  return Array.from(groups.values()).sort((left, right) =>
    left.date.localeCompare(right.date),
  )
}

export function filterEvents(
  events: ScheduleEvent[],
  filters: ScheduleFilters,
): ScheduleEvent[] {
  const query = filters.search.trim().toLowerCase()

  return events.filter((event) => {
    if (filters.department !== "all" && event.department !== filters.department) {
      return false
    }

    if (event.completed && !filters.showCompleted) return false
    if (!event.completed && !filters.showPending) return false

    if (!query) return true

    const haystack = [
      event.title,
      event.department,
      event.notes,
      event.dayOfWeek,
      event.time,
    ]
      .join(" ")
      .toLowerCase()

    return haystack.includes(query)
  })
}

export function getEventsForDate(
  events: ScheduleEvent[],
  date: string,
): ScheduleEvent[] {
  return sortByTime(events.filter((event) => event.date === date))
}

export function getUniqueDepartments(events: ScheduleEvent[]): string[] {
  return Array.from(new Set(events.map((event) => event.department))).sort(
    (left, right) => left.localeCompare(right, "ko"),
  )
}

export function getTodayDateString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function formatDisplayDate(date: string): string {
  const [, month, day] = date.split("-")
  return `${Number(month)}월 ${Number(day)}일`
}

export function formatShortDayOfWeek(dayOfWeek: string): string {
  return dayOfWeek.replace("요일", "")
}

export function getMonthDays(year: number, month: number): CalendarDay[] {
  const today = getTodayDateString()
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startOffset = firstDay.getDay()
  const totalDays = lastDay.getDate()
  const days: CalendarDay[] = []

  for (let index = 0; index < startOffset; index += 1) {
    const date = new Date(year, month - 1, -startOffset + index + 1)
    const dateString = toDateString(date)
    days.push({
      date: dateString,
      day: date.getDate(),
      isCurrentMonth: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: dateString === today,
    })
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const date = new Date(year, month - 1, day)
    const dateString = toDateString(date)
    days.push({
      date: dateString,
      day,
      isCurrentMonth: true,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: dateString === today,
    })
  }

  let trailingDay = 1
  while (days.length % 7 !== 0) {
    const date = new Date(year, month, trailingDay)
    const dateString = toDateString(date)
    days.push({
      date: dateString,
      day: date.getDate(),
      isCurrentMonth: false,
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      isToday: dateString === today,
    })
    trailingDay += 1
  }

  return days
}

function toDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getScheduleStats(events: ScheduleEvent[]) {
  const today = getTodayDateString()
  const todayEvents = getEventsForDate(events, today)

  return {
    total: events.length,
    completed: events.filter((event) => event.completed).length,
    pending: events.filter((event) => !event.completed).length,
    todayCount: todayEvents.length,
    todayEvents,
  }
}

export function linkifyNotes(notes: string): Array<{ type: "text" | "link"; value: string }> {
  const urlPattern = /\[URL\]|https?:\/\/[^\s]+/g
  const parts: Array<{ type: "text" | "link"; value: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = urlPattern.exec(notes)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: notes.slice(lastIndex, match.index) })
    }

    const value = match[0] === "[URL]" ? "관련 링크" : match[0]
    parts.push({ type: "link", value })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < notes.length) {
    parts.push({ type: "text", value: notes.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ type: "text", value: notes }]
}
