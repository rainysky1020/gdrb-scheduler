# 골든래빗 일정 대시보드

로컬 xlsx를 수정하면 Vercel 배포 사이트에도 반영되는 일정 대시보드입니다.

## 동작 방식

```
로컬 xlsx 저장 → sync-watch 스크립트 감지 → Vercel API 전송 → Blob 저장 → 배포 사이트 갱신
```

## 1. Vercel 설정

1. Vercel 프로젝트 → **Storage** → **Blob** 생성 후 프로젝트에 연결
2. **Settings → Environment Variables** 에 추가:
   - `SYNC_SECRET` : 임의의 긴 비밀 문자열 (예: `my-super-secret-key-123`)

`BLOB_READ_WRITE_TOKEN` 은 Blob 연결 시 자동으로 추가됩니다.

## 2. 로컬 sync 설정

```bash
cp .env.sync.example .env.sync
```

`.env.sync` 예시:

```env
SYNC_TARGET_URL=https://your-app.vercel.app/api/schedule/sync
SYNC_SECRET=my-super-secret-key-123
```

## 3. 실행

터미널 1 — 동기화 감시 (엑셀 수정 시 Vercel로 전송):

```bash
npm run sync:watch
```

터미널 2 — 로컬 미리보기 (선택):

```bash
npm run dev
```

## 4. 사용

1. `timetable/2025년 12월 골든래빗 일정.xlsx` 수정 후 **저장**
2. sync 터미널에 `[sync] ... → Vercel` 메시지 확인
3. Vercel 배포 사이트에서 **3초 이내** 반영 확인

## 데이터 파일 우선순위 (서버)

1. Vercel Blob에 sync된 최신 데이터
2. `data/*.xlsx` (초기 배포용 백업)
