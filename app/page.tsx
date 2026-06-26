"use client"

import { useEffect, useMemo, useState } from "react"

import { AgendaList } from "@/components/schedule/agenda-list"
import { DayEventsSheet } from "@/components/schedule/day-events-sheet"
import { EventDetailSheet } from "@/components/schedule/event-detail-sheet"
import { MonthCalendar } from "@/components/schedule/month-calendar"
import { ScheduleFiltersBar } from "@/components/schedule/schedule-filters"
import { StatsCards } from "@/components/schedule/stats-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import scheduleData from "@/data/schedule.json"
import {
  filterEvents,
  getScheduleStats,
  getUniqueDepartments,
} from "@/lib/schedule-utils"
import { DEFAULT_FILTERS, type ScheduleEvent } from "@/lib/types"

export default function DashboardPage() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [eventSheetOpen, setEventSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayEvents, setDayEvents] = useState<ScheduleEvent[]>([])
  const [daySheetOpen, setDaySheetOpen] = useState(false)

  const events = scheduleData.events as ScheduleEvent[]

  const filteredEvents = useMemo(
    () => filterEvents(events, filters),
    [events, filters],
  )

  const departments = useMemo(() => getUniqueDepartments(events), [events])
  const stats = useMemo(() => getScheduleStats(filteredEvents), [filteredEvents])

  useEffect(() => {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setActiveTab("agenda")
    }
  }, [])

  const handleSelectEvent = (event: ScheduleEvent) => {
    setSelectedEvent(event)
    setEventSheetOpen(true)
  }

  const handleSelectDate = (date: string, dateEvents: ScheduleEvent[]) => {
    setSelectedDate(date)
    setDayEvents(dateEvents)
    setDaySheetOpen(true)
  }

  return (
    <div className="min-h-svh bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="space-y-2">
          <p className="text-sm font-medium text-primary">Golden Rabbit</p>
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="font-heading text-3xl font-semibold tracking-tight">
                2025년 12월 골든래빗 일정
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                월간 캘린더와 일정 목록으로 한눈에 확인하세요.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              데이터 출처: {scheduleData.source}
            </p>
          </div>
        </header>

        <StatsCards
          total={stats.total}
          completed={stats.completed}
          pending={stats.pending}
          todayCount={stats.todayCount}
          todayEvents={stats.todayEvents}
        />

        <ScheduleFiltersBar
          filters={filters}
          departments={departments}
          onChange={setFilters}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="gap-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="calendar">월간 캘린더</TabsTrigger>
            <TabsTrigger value="agenda">일정 목록</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="mt-0">
            <MonthCalendar
              events={filteredEvents}
              onSelectEvent={handleSelectEvent}
              onSelectDate={handleSelectDate}
            />
          </TabsContent>

          <TabsContent value="agenda" className="mt-0">
            <AgendaList events={filteredEvents} onSelect={handleSelectEvent} />
          </TabsContent>
        </Tabs>
      </div>

      <EventDetailSheet
        event={selectedEvent}
        open={eventSheetOpen}
        onOpenChange={setEventSheetOpen}
      />

      <DayEventsSheet
        date={selectedDate}
        events={dayEvents}
        open={daySheetOpen}
        onOpenChange={setDaySheetOpen}
        onSelectEvent={handleSelectEvent}
      />
    </div>
  )
}
