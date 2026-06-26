import crypto from "crypto"

import * as XLSX from "xlsx"

import type { ScheduleEvent } from "@/lib/types"

export type CellValue = string | number | boolean | Date | null | undefined

export function excelDateToISO(value: CellValue): string {
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

export function excelTimeToString(value: CellValue): string {
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

function isCompleted(value: CellValue): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase()
    return normalized === "1" || normalized === "true" || normalized === "완료"
  }
  return false
}

export function parseScheduleRows(rows: CellValue[][]): ScheduleEvent[] {
  const events: ScheduleEvent[] = []

  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]
    if (!row || !row[0]) continue

    const date = excelDateToISO(row[0])
    const dayOfWeek = String(row[1] || "")
    const time = excelTimeToString(row[2])
    const title = String(row[3] || "")
    const department = String(row[4] || "")
    const completed = isCompleted(row[5])
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
