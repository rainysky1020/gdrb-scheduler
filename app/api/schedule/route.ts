import { NextResponse } from "next/server"

import { loadSchedule } from "@/lib/load-schedule"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const schedule = await loadSchedule()

    return NextResponse.json(schedule, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load schedule."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
