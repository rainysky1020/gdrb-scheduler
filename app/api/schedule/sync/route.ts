import { NextResponse } from "next/server"

import { saveLiveSchedule } from "@/lib/schedule-store"
import type { ScheduleData } from "@/lib/types"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function isAuthorized(request: Request): boolean {
  const secret = process.env.SYNC_SECRET
  if (!secret) return false

  const auth = request.headers.get("authorization")
  return auth === `Bearer ${secret}`
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured on Vercel." },
      { status: 500 },
    )
  }

  try {
    const body = (await request.json()) as ScheduleData

    if (!body.events || !Array.isArray(body.events)) {
      return NextResponse.json({ error: "Invalid schedule payload." }, { status: 400 })
    }

    await saveLiveSchedule(body)

    return NextResponse.json({
      ok: true,
      updatedAt: body.updatedAt,
      eventCount: body.events.length,
    })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to sync schedule."

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
