import { loadScheduleFromGoogleSheets, getGoogleSheetsId } from "@/lib/google-sheets"
import { loadScheduleFromXlsx } from "@/lib/parse-schedule"
import type { ScheduleData } from "@/lib/types"

export async function loadSchedule(): Promise<ScheduleData> {
  if (getGoogleSheetsId()) {
    return loadScheduleFromGoogleSheets()
  }

  return loadScheduleFromXlsx()
}
