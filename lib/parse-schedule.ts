import fs from "fs"
import os from "os"
import path from "path"

import * as XLSX from "xlsx"

import { parseScheduleRows, type CellValue } from "@/lib/schedule-rows"
import type { ScheduleData } from "@/lib/types"

export interface XlsxFileInfo {
  path: string
  name: string
  mtimeMs: number
}

export function findXlsxFile(projectRoot = process.cwd()): XlsxFileInfo | null {
  const searchDirs = process.env.VERCEL
    ? [path.join(projectRoot, "data")]
    : [path.resolve(projectRoot, ".."), path.join(projectRoot, "data")]

  for (const dir of searchDirs) {
    if (!fs.existsSync(dir)) continue

    const match = fs
      .readdirSync(dir)
      .find((file) => file.endsWith(".xlsx"))

    if (match) {
      const filePath = path.join(dir, match)
      const stat = fs.statSync(filePath)
      return {
        path: filePath,
        name: match,
        mtimeMs: stat.mtimeMs,
      }
    }
  }

  return null
}

function readWorkbook(filePath: string) {
  try {
    return XLSX.readFile(filePath)
  } catch {
    const tempPath = path.join(
      os.tmpdir(),
      `schedule-${Date.now()}.xlsx`,
    )
    fs.copyFileSync(filePath, tempPath)
    const workbook = XLSX.readFile(tempPath)
    fs.unlinkSync(tempPath)
    return workbook
  }
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
      ) as Omit<ScheduleData, "updatedAt" | "fileMtime"> & {
        updatedAt?: string
        fileMtime?: number
      }
      const stat = fs.statSync(fallbackPath)

      return {
        source: fallback.source,
        events: fallback.events,
        updatedAt: fallback.updatedAt ?? stat.mtime.toISOString(),
        fileMtime: fallback.fileMtime ?? stat.mtimeMs,
      }
    }

    throw new Error(
      "xlsx 파일을 찾을 수 없습니다. 상위 폴더 또는 data/ 폴더를 확인하세요.",
    )
  }

  const workbook = readWorkbook(xlsxFile.path)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json<CellValue[]>(sheet, {
    header: 1,
    raw: true,
    defval: "",
  })
  const stat = fs.statSync(xlsxFile.path)

  return {
    source: xlsxFile.name,
    events: parseScheduleRows(rows),
    updatedAt: stat.mtime.toISOString(),
    fileMtime: stat.mtimeMs,
  }
}

export function getWatchedXlsxPath(projectRoot = process.cwd()): string | null {
  return findXlsxFile(projectRoot)?.path ?? null
}
