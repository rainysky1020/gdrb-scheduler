"use client"

import { CheckCircle2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { getDepartmentColor } from "@/lib/department-colors"
import {
  getEventsForDate,
  getMonthDays,
} from "@/lib/schedule-utils"
import type { ScheduleEvent } from "@/lib/types"

interface MonthCalendarProps {
  events: ScheduleEvent[]
  year?: number
  month?: number
  onSelectEvent: (event: ScheduleEvent) => void
  onSelectDate: (date: string, events: ScheduleEvent[]) => void
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

export function MonthCalendar({
  events,
  year = 2025,
  month = 12,
  onSelectEvent,
  onSelectDate,
}: MonthCalendarProps) {
  const days = getMonthDays(year, month)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-medium text-muted-foreground">
        {WEEKDAYS.map((weekday) => (
          <div
            key={weekday}
            className={cn(
              "py-2",
              (weekday === "일" || weekday === "토") && "text-muted-foreground/80",
            )}
          >
            {weekday}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dayEvents = getEventsForDate(events, day.date)
          const allDayEvents = dayEvents.filter((event) => event.isAllDay)
          const timedEvents = dayEvents.filter((event) => !event.isAllDay)
          const timedPreview = timedEvents.slice(0, 2)
          const totalShown = allDayEvents.length + timedPreview.length
          const hiddenCount = dayEvents.length - totalShown

          return (
            <Card
              key={day.date}
              className={cn(
                "min-h-28 gap-0 overflow-hidden py-0 shadow-none transition-colors",
                day.isCurrentMonth ? "bg-card" : "bg-muted/30 text-muted-foreground",
                day.isWeekend && day.isCurrentMonth && "bg-muted/20",
                day.isToday && "ring-2 ring-primary",
              )}
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectDate(day.date, dayEvents)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onSelectDate(day.date, dayEvents)
                  }
                }}
                className="flex h-full w-full cursor-pointer flex-col p-2 text-left"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex size-7 items-center justify-center rounded-full text-sm font-medium",
                      day.isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {day.day}
                  </span>
                  {dayEvents.length > 0 ? (
                    <span className="text-[10px] text-muted-foreground">
                      {dayEvents.length}건
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1">
                  {allDayEvents.map((event) => (
                    <CalendarEventChip
                      key={event.id}
                      event={event}
                      allDay
                      onSelect={onSelectEvent}
                    />
                  ))}

                  {timedPreview.map((event) => (
                      <CalendarEventChip
                        key={event.id}
                        event={event}
                        onSelect={onSelectEvent}
                      />
                    ))}

                  {hiddenCount > 0 ? (
                    <Badge variant="secondary" className="w-full justify-center text-[10px]">
                      +{hiddenCount} more
                    </Badge>
                  ) : null}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function CalendarEventChip({
  event,
  onSelect,
  allDay = false,
}: {
  event: ScheduleEvent
  onSelect: (event: ScheduleEvent) => void
  allDay?: boolean
}) {
  const departmentColor = getDepartmentColor(event.department)

  return (
    <button
      type="button"
      onClick={(clickEvent) => {
        clickEvent.stopPropagation()
        onSelect(event)
      }}
      className={cn(
        "flex w-full items-center gap-1 rounded px-1.5 py-0.5 text-left text-[10px] leading-tight",
        allDay ? "bg-primary/10 font-medium" : "bg-accent/60",
        event.completed && "opacity-60",
      )}
      style={{ borderLeft: `3px solid ${departmentColor}` }}
    >
      <span className="truncate">
        {allDay ? "종일" : event.time} {event.title}
      </span>
      {event.completed ? (
        <CheckCircle2 className="size-3 shrink-0 text-primary" />
      ) : null}
    </button>
  )
}
