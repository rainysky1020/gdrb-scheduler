import fs from "fs"

import { getWatchedXlsxPath } from "@/lib/parse-schedule"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  const filePath = getWatchedXlsxPath()

  if (!filePath) {
    return new Response("xlsx file not found", { status: 404 })
  }

  let watcher: fs.FSWatcher | null = null
  let heartbeat: NodeJS.Timeout | null = null
  let debounce: NodeJS.Timeout | null = null

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const send = (payload: Record<string, number | string>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        )
      }

      const pushMtime = () => {
        if (debounce) clearTimeout(debounce)
        debounce = setTimeout(() => {
          try {
            const stat = fs.statSync(filePath)
            send({ type: "change", mtime: stat.mtimeMs })
          } catch {
            send({ type: "error", message: "stat failed" })
          }
        }, 300)
      }

      pushMtime()
      watcher = fs.watch(filePath, pushMtime)
      heartbeat = setInterval(() => {
        send({ type: "ping", mtime: Date.now() })
      }, 15000)
    },
    cancel() {
      watcher?.close()
      if (heartbeat) clearInterval(heartbeat)
      if (debounce) clearTimeout(debounce)
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  })
}
