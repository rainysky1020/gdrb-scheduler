"use client"

import { EventCard } from "@/components/schedule/event-card"
import { Separator } from "@/components/ui/separator"
import {
  formatDisplayDate,
  formatShortDayOfWeek,
  groupByDate,
} from "@/lib/schedule-utils"
import type { ScheduleEvent } from "@/lib/types"

interface AgendaListProps {
  events: ScheduleEvent[]
  onSelect: (event: ScheduleEvent) => void
}

export function AgendaList({ events, onSelect }: AgendaListProps) {
  const groups = groupByDate(events)

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-10 text-center text-muted-foreground">
        조건에 맞는 일정이 없습니다.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.date} className="space-y-3">
          <div className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 py-2 backdrop-blur">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold">
                {formatDisplayDate(group.date)} (
                {formatShortDayOfWeek(group.dayOfWeek)})
              </h3>
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">
                {group.events.length}건
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {group.events.map((event) => (
              <EventCard key={event.id} event={event} onSelect={onSelect} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
