"use client"

import { CalendarDays, CheckCircle2, CircleDashed, ListTodo } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ScheduleEvent } from "@/lib/types"

interface StatsCardsProps {
  total: number
  completed: number
  pending: number
  todayCount: number
  todayEvents: ScheduleEvent[]
}

export function StatsCards({
  total,
  completed,
  pending,
  todayCount,
  todayEvents,
}: StatsCardsProps) {
  const todayLabel =
    todayCount > 0
      ? todayEvents
          .slice(0, 2)
          .map((event) => event.title)
          .join(", ")
      : "일정 없음"

  const items = [
    {
      title: "총 일정",
      value: `${total}건`,
      description: "12월 전체 일정",
      icon: ListTodo,
    },
    {
      title: "완료",
      value: `${completed}건`,
      description: "진행 완료된 일정",
      icon: CheckCircle2,
      accent: "text-primary",
    },
    {
      title: "미완료",
      value: `${pending}건`,
      description: "아직 진행 중인 일정",
      icon: CircleDashed,
      accent: "text-amber-600 dark:text-amber-400",
    },
    {
      title: "오늘 일정",
      value: `${todayCount}건`,
      description: todayLabel,
      icon: CalendarDays,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <Card key={item.title} className="shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.title}
            </CardTitle>
            <item.icon className={`size-4 ${item.accent ?? "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{item.value}</div>
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
