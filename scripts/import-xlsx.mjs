import XLSX from "xlsx"
import fs from "fs"
import path from "path"
import crypto from "crypto"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, "..")
const parentDir = path.resolve(projectRoot, "..")

const xlsxFiles = fs
  .readdirSync(parentDir)
  .filter((file) => file.endsWith(".xlsx"))

if (xlsxFiles.length === 0) {
  console.error(`No xlsx file found in ${parentDir}`)
  process.exit(1)
}

const xlsxPath = path.join(parentDir, xlsxFiles[0])

function excelDateToISO(value) {
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

const workbook = XLSX.readFile(xlsxPath)
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

const outputPath = path.join(projectRoot, "data", "schedule.json")
fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(
  outputPath,
  JSON.stringify({ source: xlsxFiles[0], events }, null, 2),
  "utf-8",
)
console.log(`Imported ${events.length} events from ${xlsxFiles[0]}`)
