import { NextResponse } from "next/server"

import { loadScheduleFromXlsx } from "@/lib/parse-schedule"
import { getLiveSchedule } from "@/lib/schedule-store"
import type { ScheduleData } from "@/lib/types"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const runtime = "nodejs"

export async function GET() {
  try {
    const live = await getLiveSchedule()
    const schedule: ScheduleData = live ?? loadScheduleFromXlsx()

    return NextResponse.json(schedule, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("GET /api/schedule failed:", error)
    const message =
      error instanceof Error ? error.message : "Failed to load schedule."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
