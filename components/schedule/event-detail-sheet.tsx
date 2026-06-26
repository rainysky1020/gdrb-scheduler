"use client"

import { CalendarDays, Clock3, MapPin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { getDepartmentColor } from "@/lib/department-colors"
import {
  formatDisplayDate,
  formatShortDayOfWeek,
  linkifyNotes,
} from "@/lib/schedule-utils"
import type { ScheduleEvent } from "@/lib/types"

interface EventDetailSheetProps {
  event: ScheduleEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EventDetailSheet({
  event,
  open,
  onOpenChange,
}: EventDetailSheetProps) {
  if (!event) return null

  const departmentColor = getDepartmentColor(event.department)
  const noteParts = linkifyNotes(event.notes)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="pr-8 text-left text-xl leading-snug">
            {event.title}
          </SheetTitle>
          <SheetDescription className="text-left">
            일정 상세 정보
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              style={{ borderLeft: `3px solid ${departmentColor}` }}
            >
              {event.department}
            </Badge>
            <Badge variant={event.completed ? "default" : "outline"}>
              {event.completed ? "완료" : "미완료"}
            </Badge>
            {event.isAllDay ? <Badge variant="outline">종일 일정</Badge> : null}
          </div>

          <div className="space-y-4 text-sm">
            <DetailRow
              icon={CalendarDays}
              label="날짜"
              value={`${formatDisplayDate(event.date)} (${formatShortDayOfWeek(event.dayOfWeek)})`}
            />
            <DetailRow
              icon={Clock3}
              label="시간"
              value={event.isAllDay ? "종일" : event.time}
            />
            {event.notes ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>비고</span>
                </div>
                <p className="rounded-lg bg-muted/50 p-3 leading-relaxed">
                  {noteParts.map((part, index) =>
                    part.type === "link" ? (
                      <span
                        key={`${part.value}-${index}`}
                        className="font-medium text-primary underline-offset-4 hover:underline"
                      >
                        {part.value}
                      </span>
                    ) : (
                      <span key={`${part.value}-${index}`}>{part.value}</span>
                    ),
                  )}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div>
        <p className="text-muted-foreground">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  )
}
