"use client"

import { CheckCircle2, Clock3 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getDepartmentColor } from "@/lib/department-colors"
import type { ScheduleEvent } from "@/lib/types"

interface EventCardProps {
  event: ScheduleEvent
  onSelect: (event: ScheduleEvent) => void
  compact?: boolean
}

export function EventCard({ event, onSelect, compact = false }: EventCardProps) {
  const departmentColor = getDepartmentColor(event.department)

  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={cn(
        "group w-full rounded-lg border bg-card text-left transition-colors hover:bg-accent/40",
        compact ? "p-2" : "p-3",
        event.completed ? "opacity-70" : "border-l-4",
      )}
      style={event.completed ? undefined : { borderLeftColor: departmentColor }}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex min-w-14 items-center gap-1 text-xs font-medium text-muted-foreground">
          {event.isAllDay ? (
            <span>종일</span>
          ) : (
            <>
              <Clock3 className="size-3.5" />
              <span>{event.time}</span>
            </>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p
              className={cn(
                "font-medium leading-snug",
                event.completed && "line-through",
                compact ? "text-sm" : "text-base",
              )}
            >
              {event.title}
            </p>
            {event.completed ? (
              <CheckCircle2 className="size-4 shrink-0 text-primary" />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="max-w-full truncate"
              style={{ borderLeft: `3px solid ${departmentColor}` }}
            >
              {event.department}
            </Badge>
            <Badge variant={event.completed ? "default" : "outline"}>
              {event.completed ? "완료" : "미완료"}
            </Badge>
          </div>

          {!compact && event.notes ? (
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {event.notes}
            </p>
          ) : null}
        </div>
      </div>
    </button>
  )
}
