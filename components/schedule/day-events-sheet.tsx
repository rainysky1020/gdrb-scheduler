"use client"

import { EventCard } from "@/components/schedule/event-card"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { formatDisplayDate } from "@/lib/schedule-utils"
import type { ScheduleEvent } from "@/lib/types"

interface DayEventsSheetProps {
  date: string | null
  events: ScheduleEvent[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectEvent: (event: ScheduleEvent) => void
}

export function DayEventsSheet({
  date,
  events,
  open,
  onOpenChange,
  onSelectEvent,
}: DayEventsSheetProps) {
  const dayOfWeek = events[0]?.dayOfWeek ?? ""

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="text-left">
            {date ? formatDisplayDate(date) : "일정"}
          </SheetTitle>
          <SheetDescription className="text-left">
            {dayOfWeek ? `${dayOfWeek} · ${events.length}건` : "선택한 날짜의 일정"}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-2 px-4 pb-6">
          {events.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              이 날짜에는 일정이 없습니다.
            </p>
          ) : (
            events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={onSelectEvent}
                compact
              />
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
