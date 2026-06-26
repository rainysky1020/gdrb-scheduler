"use client"

import { useEffect, useMemo, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { AgendaList } from "@/components/schedule/agenda-list"
import { DayEventsSheet } from "@/components/schedule/day-events-sheet"
import { EventDetailSheet } from "@/components/schedule/event-detail-sheet"
import { MonthCalendar } from "@/components/schedule/month-calendar"
import { ScheduleFiltersBar } from "@/components/schedule/schedule-filters"
import { StatsCards } from "@/components/schedule/stats-cards"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSchedule } from "@/hooks/use-schedule"
import {
  filterEvents,
  getScheduleStats,
  getUniqueDepartments,
} from "@/lib/schedule-utils"
import { DEFAULT_FILTERS, type ScheduleEvent } from "@/lib/types"

function formatUpdatedAt(value: string | null) {
  if (!value) return "-"

  return new Intl.DateTimeFormat("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value))
}

export default function DashboardPage() {
  const { events, source, updatedAt, isLoading, error, refresh } =
    useSchedule()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [activeTab, setActiveTab] = useState("calendar")
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null)
  const [eventSheetOpen, setEventSheetOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [dayEvents, setDayEvents] = useState<ScheduleEvent[]>([])
  const [daySheetOpen, setDaySheetOpen] = useState(false)

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

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          일정을 불러오는 중...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center px-4">
        <div className="max-w-md space-y-4 rounded-xl border p-6 text-center">
          <p className="font-medium">일정을 불러오지 못했습니다</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => refresh()}>다시 시도</Button>
        </div>
      </div>
    )
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
                스프레드시트 수정 시 3초 이내 자동 반영됩니다.
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground lg:items-end">
              <p>데이터 출처: {source}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <span className="size-2 rounded-full bg-primary animate-pulse" />
                  실시간 동기화
                </span>
                <span>마지막 반영: {formatUpdatedAt(updatedAt)}</span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => refresh()}
                  aria-label="일정 새로고침"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
            </div>
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
