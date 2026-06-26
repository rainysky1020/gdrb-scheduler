import fs from "fs"

import { findXlsxFile, loadEnvFile, parseXlsxFile } from "./xlsx-parse.mjs"

const env = {
  ...loadEnvFile(".env.local"),
  ...loadEnvFile(".env.sync"),
  ...process.env,
}

const syncUrl = env.SYNC_TARGET_URL
const syncSecret = env.SYNC_SECRET

if (!syncUrl || !syncSecret) {
  console.error(`
로컬 xlsx → Vercel 동기화 설정이 필요합니다.

dashboard/.env.sync 파일을 만들고 아래를 입력하세요:

SYNC_TARGET_URL=https://your-app.vercel.app/api/schedule/sync
SYNC_SECRET=vercel에_설정한_동일한_비밀키
`)
  process.exit(1)
}

const xlsxFile = findXlsxFile()
if (!xlsxFile) {
  console.error("xlsx 파일을 찾을 수 없습니다.")
  process.exit(1)
}

let syncing = false
let debounce = null
let lastMtime = null

async function pushSchedule() {
  if (syncing) return
  syncing = true

  try {
    const schedule = parseXlsxFile(xlsxFile.path, xlsxFile.name)
    const response = await fetch(syncUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${syncSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(schedule),
    })

    const result = await response.json()
    if (!response.ok) {
      throw new Error(result.error ?? `Sync failed (${response.status})`)
    }

    lastMtime = schedule.fileMtime
    console.log(
      `[sync] ${schedule.source} → Vercel (${schedule.events.length}건, ${schedule.updatedAt})`,
    )
  } catch (error) {
    console.error("[sync] 실패:", error.message)
  } finally {
    syncing = false
  }
}

function scheduleSync() {
  if (debounce) clearTimeout(debounce)
  debounce = setTimeout(() => {
    pushSchedule()
  }, 500)
}

console.log(`감시 중: ${xlsxFile.path}`)
console.log(`전송 대상: ${syncUrl}`)
console.log("엑셀 파일을 저장하면 Vercel 사이트에 반영됩니다.\n")

pushSchedule()

fs.watch(xlsxFile.path, () => {
  try {
    const stat = fs.statSync(xlsxFile.path)
    if (lastMtime !== null && stat.mtimeMs === lastMtime) return
    scheduleSync()
  } catch {
    scheduleSync()
  }
})
