"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { ScheduleData, ScheduleEvent } from "@/lib/types"

const POLL_INTERVAL_MS = 3000

export function useSchedule() {
  const [events, setEvents] = useState<ScheduleEvent[]>([])
  const [source, setSource] = useState("")
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastMtimeRef = useRef<number | null>(null)

  const applySchedule = useCallback((data: ScheduleData) => {
    setEvents(data.events)
    setSource(data.source)
    setUpdatedAt(data.updatedAt)
    lastMtimeRef.current = data.fileMtime
    setError(null)
  }, [])

  const fetchSchedule = useCallback(async () => {
    try {
      const response = await fetch("/api/schedule", { cache: "no-store" })
      const text = await response.text()
      let data = {} as ScheduleData & { error?: string }

      try {
        data = text ? JSON.parse(text) : {}
      } catch {
        throw new Error("일정 API가 JSON 대신 HTML을 반환했습니다. 서버 배포 상태를 확인하세요.")
      }

      if (!response.ok) {
        throw new Error(data.error ?? "일정을 불러오지 못했습니다.")
      }

      if (lastMtimeRef.current !== data.fileMtime) {
        applySchedule(data)
      }
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "일정을 불러오지 못했습니다.",
      )
    } finally {
      setIsLoading(false)
    }
  }, [applySchedule])

  useEffect(() => {
    fetchSchedule()

    let eventSource: EventSource | null = null

    if (process.env.NODE_ENV === "development") {
      eventSource = new EventSource("/api/schedule/watch")

      eventSource.onmessage = (event) => {
        const payload = JSON.parse(event.data) as {
          type: string
          mtime?: number
        }

        if (payload.type === "change" && payload.mtime !== undefined) {
          if (lastMtimeRef.current !== payload.mtime) {
            fetchSchedule()
          }
        }
      }

      eventSource.onerror = () => {
        eventSource?.close()
      }
    }

    const intervalId = window.setInterval(fetchSchedule, POLL_INTERVAL_MS)

    return () => {
      eventSource?.close()
      window.clearInterval(intervalId)
    }
  }, [fetchSchedule])

  return {
    events,
    source,
    updatedAt,
    isLoading,
    error,
    refresh: fetchSchedule,
  }
}
