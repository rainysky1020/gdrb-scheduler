export type SyncMode = "google-sheets" | "xlsx"

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
  syncMode: SyncMode
  updatedAt: string
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
