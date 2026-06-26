const DEPARTMENT_COLORS: Record<string, string> = {
  "경영 기획팀": "var(--chart-1)",
  "영업 1팀": "var(--chart-2)",
  "IT 기술팀": "var(--chart-3)",
  "구매/법무팀": "var(--chart-4)",
  "디자인/개발팀": "var(--chart-5)",
  나: "var(--primary)",
  마케팅팀: "var(--chart-1)",
  "인사 총무팀": "var(--chart-2)",
  "재무 회계팀": "var(--chart-3)",
  개발팀: "var(--chart-4)",
  "전 부서": "var(--chart-5)",
  "영업/마케팅팀": "var(--chart-1)",
  "생산/물류팀": "var(--chart-2)",
  "생산/재고팀": "var(--chart-3)",
  "해외 사업팀": "var(--chart-4)",
  "-": "var(--muted-foreground)",
}

const FALLBACK_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function getDepartmentColor(department: string): string {
  if (DEPARTMENT_COLORS[department]) {
    return DEPARTMENT_COLORS[department]
  }

  let hash = 0
  for (let index = 0; index < department.length; index += 1) {
    hash = department.charCodeAt(index) + ((hash << 5) - hash)
  }

  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}
