import { parseScheduleRows, type CellValue } from "@/lib/schedule-rows"
import type { ScheduleData } from "@/lib/types"

function extractSheetId(value: string): string {
  const match = value.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)
  return match ? match[1] : value.trim()
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        index += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field)
      if (row.some((cell) => cell.length > 0)) {
        rows.push(row)
      }
      row = []
      field = ""
      if (char === "\r") index += 1
    } else if (char !== "\r") {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((cell) => cell.length > 0)) {
      rows.push(row)
    }
  }

  return rows
}

async function fetchRowsFromSheetsApi(sheetId: string): Promise<CellValue[][]> {
  const apiKey = process.env.GOOGLE_SHEETS_API_KEY
  if (!apiKey) {
    throw new Error("GOOGLE_SHEETS_API_KEY is not configured.")
  }

  const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A:G"
  const url = new URL(
    `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}`,
  )
  url.searchParams.set("key", apiKey)

  const response = await fetch(url.toString(), { cache: "no-store" })
  if (!response.ok) {
    throw new Error(
      `Google Sheets API error (${response.status}). API 키와 시트 공유 설정을 확인하세요.`,
    )
  }

  const payload = (await response.json()) as { values?: CellValue[][] }
  return payload.values ?? []
}

async function fetchRowsFromCsvExport(sheetId: string): Promise<CellValue[][]> {
  const gid = process.env.GOOGLE_SHEETS_GID || "0"
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`

  const response = await fetch(url, { cache: "no-store" })
  if (!response.ok) {
    throw new Error(
      "Google Sheet에 접근할 수 없습니다. '링크가 있는 모든 사용자'에게 보기 권한을 열어주세요.",
    )
  }

  const csv = await response.text()
  if (csv.includes("<!DOCTYPE html") || csv.includes("<html")) {
    throw new Error(
      "Google Sheet를 불러오지 못했습니다. 시트 공유 설정을 확인하세요.",
    )
  }

  return parseCsv(csv)
}

export function getGoogleSheetsId(): string | null {
  const raw = process.env.GOOGLE_SHEETS_ID?.trim()
  if (!raw) return null
  return extractSheetId(raw)
}

export async function loadScheduleFromGoogleSheets(): Promise<ScheduleData> {
  const sheetId = getGoogleSheetsId()
  if (!sheetId) {
    throw new Error("GOOGLE_SHEETS_ID is not configured.")
  }

  const rows = process.env.GOOGLE_SHEETS_API_KEY
    ? await fetchRowsFromSheetsApi(sheetId)
    : await fetchRowsFromCsvExport(sheetId)

  if (rows.length === 0) {
    throw new Error("Google Sheet에 일정 데이터가 없습니다.")
  }

  const sheetLabel = process.env.GOOGLE_SHEETS_NAME || "Google Sheets"

  return {
    source: sheetLabel,
    events: parseScheduleRows(rows),
    syncMode: "google-sheets",
    updatedAt: new Date().toISOString(),
  }
}
