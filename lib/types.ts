export interface ScheduleEvent {
  id: string
  date: string
  dayOfWeek: string
  time: string
  title: string
  department: string
  completed: boolean
  notes: string
  isAllDay: boolean
}

export interface ScheduleData {
  source: string
  events: ScheduleEvent[]
  updatedAt: string
  fileMtime: number
}

export interface ScheduleFilters {
  search: string
  department: string
  showCompleted: boolean
  showPending: boolean
}

export const DEFAULT_FILTERS: ScheduleFilters = {
  search: "",
  department: "all",
  showCompleted: true,
  showPending: true,
}
