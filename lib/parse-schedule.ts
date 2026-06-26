import fs from "fs"
import path from "path"

import * as XLSX from "xlsx"

import { parseScheduleRows, type CellValue } from "@/lib/schedule-rows"
import type { ScheduleData } from "@/lib/types"

export function findXlsxFile(projectRoot: string) {
  const searchDirs = [path.join(projectRoot, "data")]

  if (process.env.NODE_ENV === "development") {
    searchDirs.push(path.resolve(projectRoot, ".."))
  }

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue

    const match = fs
      .readdirSync(dir)
      .find((file) => file.endsWith(".xlsx"))

    if (match) {
      const filePath = path.join(dir, match)
      return {
        path: filePath,
        name: match,
        mtimeMs: fs.statSync(filePath).mtimeMs,
      }
    }
  }

  return null
}

export function loadScheduleFromXlsx(
  projectRoot = process.cwd(),
): ScheduleData {
  const xlsxFile = findXlsxFile(projectRoot)

  if (!xlsxFile) {
    const fallbackPath = path.join(projectRoot, "data", "schedule.json")
    if (fs.existsSync(fallbackPath)) {
      const fallback = JSON.parse(
        fs.readFileSync(fallbackPath, "utf-8"),
      ) as Omit<ScheduleData, "syncMode" | "updatedAt"> & {
        updatedAt?: string
      }
      const stat = fs.statSync(fallbackPath)

      return {
        source: fallback.source,
        events: fallback.events,
        syncMode: "xlsx",
        updatedAt: fallback.updatedAt ?? stat.mtime.toISOString(),
      }
    }

    throw new Error("No xlsx file or schedule.json found.")
  }

  const workbook = XLSX.readFile(xlsxFile.path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<CellValue[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
  })

  return {
    source: xlsxFile.name,
    events: parseScheduleRows(rows),
    syncMode: "xlsx",
    updatedAt: new Date(xlsxFile.mtimeMs).toISOString(),
  }
}
