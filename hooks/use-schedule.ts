"use client"

import { useCallback, useEffect, useState } from "react"

import type { ScheduleData, ScheduleEvent } from "@/lib/types"

const POLL_INTERVAL_MS = 3000

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [source, setSource] = useState("")
  const [syncMode, setSyncMode] = useState<ScheduleData["syncMode"]>("xlsx")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" })
      const data = (await response.json()) as ScheduleData & {
        error?: string
      }

      if (!response.ok) {
        throw new Error(data.error ?? "일정을 불러오지 못했습니다.")
      }

      setEvents(data.events)
      setSource(data.source)
      setSyncMode(data.syncMode)
      setUpdatedAt(data.updatedAt)
      setError(null)
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "일정을 불러오지 못했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSchedule()
    const intervalId = window.setInterval(fetchSchedule, POLL_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [fetchSchedule])

  return {
    events,
    source,
    syncMode,
    updatedAt,
    isLoading,
    error,
    refresh: fetchSchedule,
  }
}
