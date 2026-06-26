# 골든래빗 일정 대시보드

Google Sheets와 실시간 연동되는 일정 대시보드입니다.

## Google Sheets 연동 설정

1. Google Sheets에 아래 컬럼으로 일정 시트를 만듭니다.

| 날짜 | 요일 | 시간 | 주요 일정/내용 | 담당 부서 | 진행 상태 (완료 여부) | 비고 |
|------|------|------|----------------|-----------|----------------------|------|

2. 시트 공유 설정을 **링크가 있는 모든 사용자 · 뷰어**로 변경합니다.

3. 시트 URL에서 ID를 복사합니다.
   - 예: `https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz/edit`
   - ID: `1AbCdEfGhIjKlMnOpQrStUvWxYz`

4. 환경 변수를 설정합니다.

```bash
cp .env.example .env.local
```

`.env.local` 예시:

```env
GOOGLE_SHEETS_ID=1AbCdEfGhIjKlMnOpQrStUvWxYz
GOOGLE_SHEETS_NAME=2025년 12월 골든래빗 일정
```

5. Vercel에도 동일한 환경 변수를 추가한 뒤 재배포합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`GOOGLE_SHEETS_ID`가 없으면 `data/` 폴더의 xlsx 파일을 사용합니다.

## 실시간 반영

브라우저가 3초마다 `/api/schedule`을 호출합니다. Google Sheets를 수정하고 저장하면 대시보드에 자동 반영됩니다.
