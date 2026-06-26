import crypto from "crypto"
import fs from "fs"
import path from "path"

import * as XLSX from "xlsx"

import type { ScheduleData, ScheduleEvent } from "@/lib/types"

type CellValue = string | number | boolean | Date | null | undefined

function excelDateToISO(value: CellValue): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10)
  }

  const serial = Number(value)
  if (!Number.isNaN(serial)) {
    const parsed = XLSX.SSF.parse_date_code(serial)
    if (parsed) {
      const month = String(parsed.m).padStart(2, "0")
      const day = String(parsed.d).padStart(2, "0")
      return `${parsed.y}-${month}-${day}`
    }
  }

  return String(value)
}

function excelTimeToString(value: CellValue): string {
  if (value === "종일") return "종일"
  if (value === null || value === undefined || value === "") return ""

  if (typeof value === "string") {
    if (value === "종일") return "종일"
    if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  }

  const fraction = Number(value)
  if (!Number.isNaN(fraction) && fraction >= 0 && fraction < 1) {
    const totalMinutes = Math.round(fraction * 24 * 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
  }

  return String(value)
}

function makeId(date: string, time: string, title: string): string {
  return crypto
    .createHash("md5")
    .update(`${date}|${time}|${title}`)
    .digest("hex")
    .slice(0, 12)
}

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

function parseRows(rows: CellValue[][]): ScheduleEvent[] {
  const events: ScheduleEvent[] = []

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]
    if (!row || !row[0]) continue

    const date = excelDateToISO(row[0])
    const dayOfWeek = String(row[1] || "")
    const time = excelTimeToString(row[2])
    const title = String(row[3] || "")
    const department = String(row[4] || "")
    const completed = row[5] === 1 || row[5] === "1" || row[5] === true
    const notes = String(row[6] || "")
    const isAllDay = time === "종일"

    events.push({
      id: makeId(date, time, title),
      date,
      dayOfWeek,
      time,
      title,
      department,
      completed,
      notes,
      isAllDay,
    })
  }

  return events
}

export function loadScheduleFromXlsx(
  projectRoot = process.cwd(),
): ScheduleData & { updatedAt: string; fileMtime: number } {
  const xlsxFile = findXlsxFile(projectRoot)

  if (!xlsxFile) {
    const fallbackPath = path.join(projectRoot, "data", "schedule.json")
    if (fs.existsSync(fallbackPath)) {
      const fallback = JSON.parse(
        fs.readFileSync(fallbackPath, "utf-8"),
      ) as ScheduleData
      const stat = fs.statSync(fallbackPath)

      return {
        ...fallback,
        updatedAt: stat.mtime.toISOString(),
        fileMtime: stat.mtimeMs,
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
    events: parseRows(rows),
    updatedAt: new Date(xlsxFile.mtimeMs).toISOString(),
    fileMtime: xlsxFile.mtimeMs,
  }
}
