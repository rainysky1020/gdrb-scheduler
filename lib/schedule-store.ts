import { list } from "@vercel/blob"

import type { ScheduleData } from "@/lib/types"

const LIVE_BLOB_PATH = "schedule/live.json"

export async function getLiveSchedule(): Promise<ScheduleData | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null
  }

  try {
    const { blobs } = await list({ prefix: LIVE_BLOB_PATH, limit: 1 })
    const blob = blobs.find((item) => item.pathname === LIVE_BLOB_PATH)

    if (!blob) return null

    const response = await fetch(blob.url, { cache: "no-store" })
    if (!response.ok) return null

    return (await response.json()) as ScheduleData
  } catch {
    return null
  }
}

export async function saveLiveSchedule(data: ScheduleData): Promise<void> {
  const { put } = await import("@vercel/blob")

  await put(LIVE_BLOB_PATH, JSON.stringify(data), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  })
}
