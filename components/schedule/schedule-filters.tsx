"use client"

import { Search } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ScheduleFilters } from "@/lib/types"

interface ScheduleFiltersBarProps {
  filters: ScheduleFilters
  departments: string[]
  onChange: (filters: ScheduleFilters) => void
}

export function ScheduleFiltersBar({
  filters,
  departments,
  onChange,
}: ScheduleFiltersBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(event) =>
            onChange({ ...filters, search: event.target.value })
          }
          placeholder="제목, 부서, 비고 검색"
          className="pl-9"
        />
      </div>

      <Select
        value={filters.department}
        onValueChange={(department) => onChange({ ...filters, department })}
      >
        <SelectTrigger className="w-full lg:w-48">
          <SelectValue placeholder="부서 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체 부서</SelectItem>
          {departments.map((department) => (
            <SelectItem key={department} value={department}>
              {department}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.showCompleted}
            onCheckedChange={(checked) =>
              onChange({ ...filters, showCompleted: checked === true })
            }
          />
          완료
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={filters.showPending}
            onCheckedChange={(checked) =>
              onChange({ ...filters, showPending: checked === true })
            }
          />
          미완료
        </label>
      </div>
    </div>
  )
}
