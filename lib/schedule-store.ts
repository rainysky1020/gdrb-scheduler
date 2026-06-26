import type { ScheduleData } from "@/lib/types"

const LIVE_BLOB_PATH = "schedule/live.json"

function getBlobAccess(): "private" | "public" {
  return process.env.BLOB_STORE_ACCESS === "public" ? "public" : "private"
}

async function loadBlobModule() {
  return import("@vercel/blob")
}

export async function getLiveSchedule(): Promise<ScheduleData | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return null
  }

  try {
    const { get } = await loadBlobModule()
    const result = await get(LIVE_BLOB_PATH, {
      access: getBlobAccess(),
    })

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null
    }

    const text = await new Response(result.stream).text()
    return JSON.parse(text) as ScheduleData
  } catch (error) {
    console.error("getLiveSchedule failed:", error)
    return null
  }
}

export async function saveLiveSchedule(data: ScheduleData): Promise<void> {
  const { put } = await loadBlobModule()

  await put(LIVE_BLOB_PATH, JSON.stringify(data), {
    access: getBlobAccess(),
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  })
}
