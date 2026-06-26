import crypto from "crypto"
import fs from "fs"
import os from "os"
import path from "path"
import { fileURLToPath } from "url"

import XLSX from "xlsx"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")

function excelDateToISO(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
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

function excelTimeToString(value) {
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

function makeId(date, time, title) {
  return crypto
    .createHash("md5")
    .update(`${date}|${time}|${title}`)
    .digest("hex")
    .slice(0, 12)
}

export function findXlsxFile() {
  const searchDirs = [
    path.resolve(projectRoot, ".."),
    path.join(projectRoot, "data"),
  ]

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue
    const match = fs.readdirSync(dir).find((file) => file.endsWith(".xlsx"))
    if (match) {
      const filePath = path.join(dir, match)
      return { path: filePath, name: match }
    }
  }
  return null
}

function readWorkbook(filePath) {
  try {
    return XLSX.readFile(filePath)
  } catch {
    const tempPath = path.join(os.tmpdir(), `schedule-${Date.now()}.xlsx`)
    fs.copyFileSync(filePath, tempPath)
    const workbook = XLSX.readFile(tempPath)
    fs.unlinkSync(tempPath)
    return workbook
  }
}

export function parseXlsxFile(filePath, fileName) {
  const workbook = readWorkbook(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    raw: true,
    defval: "",
  })

  const events = []
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index]
    if (!row || !row[0]) continue

    const date = excelDateToISO(row[0])
    const time = excelTimeToString(row[2])
    const completed =
      row[5] === 1 ||
      row[5] === "1" ||
      row[5] === true ||
      String(row[5]).trim().toLowerCase() === "완료"

    events.push({
      id: makeId(date, time, String(row[3] || "")),
      date,
      dayOfWeek: String(row[1] || ""),
      time,
      title: String(row[3] || ""),
      department: String(row[4] || ""),
      completed,
      notes: String(row[6] || ""),
      isAllDay: time === "종일",
    })
  }

  const stat = fs.statSync(filePath)
  return {
    source: fileName,
    events,
    updatedAt: stat.mtime.toISOString(),
    fileMtime: stat.mtimeMs,
  }
}

export function loadEnvFile(fileName) {
  const envPath = path.join(projectRoot, fileName)
  if (!fs.existsSync(envPath)) return {}

  const values = {}
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const separator = trimmed.indexOf("=")
    if (separator === -1) continue
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim()
    values[key] = value
  }
  return values
}
