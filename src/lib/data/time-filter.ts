import { Deal } from "./schema"

export type TimeGranularity = "all" | "year" | "quarter" | "month"

export interface TimeFilter {
  granularity: TimeGranularity
  year: number | null
  quarter: number | null  // 1–4
  month: number | null    // 0–11
}

export const DEFAULT_TIME_FILTER: TimeFilter = {
  granularity: "all",
  year: null,
  quarter: null,
  month: null,
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export interface PeriodOption {
  value: string
  label: string
  year: number
  quarter?: number
  month?: number
}

export interface AvailablePeriods {
  years: PeriodOption[]
  quarters: PeriodOption[]
  months: PeriodOption[]
}

export function getAvailablePeriods(deals: Deal[]): AvailablePeriods {
  const yearSet = new Set<number>()
  const quarterSet = new Set<string>()
  const monthSet = new Set<string>()

  for (const deal of deals) {
    if (!deal.closeDate) continue
    const d = deal.closeDate
    const y = d.getFullYear()
    const q = Math.floor(d.getMonth() / 3) + 1
    const m = d.getMonth()
    yearSet.add(y)
    quarterSet.add(`${y}-${q}`)
    monthSet.add(`${y}-${m}`)
  }

  const years: PeriodOption[] = Array.from(yearSet)
    .sort()
    .map((y) => ({ value: `${y}`, label: `${y}`, year: y }))

  const quarters: PeriodOption[] = Array.from(quarterSet)
    .map((s) => {
      const [y, q] = s.split("-").map(Number)
      return { value: s, label: `Q${q} ${y}`, year: y, quarter: q }
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.quarter! - b.quarter!)

  const months: PeriodOption[] = Array.from(monthSet)
    .map((s) => {
      const [y, m] = s.split("-").map(Number)
      return { value: s, label: `${MONTH_NAMES[m]} ${y}`, year: y, month: m }
    })
    .sort((a, b) => a.year !== b.year ? a.year - b.year : a.month! - b.month!)

  return { years, quarters, months }
}

export function applyTimeFilter(deals: Deal[], filter: TimeFilter): Deal[] {
  if (filter.granularity === "all") return deals
  return deals.filter((deal) => {
    if (!deal.closeDate) return false
    const d = deal.closeDate
    const y = d.getFullYear()
    const q = Math.floor(d.getMonth() / 3) + 1
    const m = d.getMonth()
    if (filter.granularity === "year") return filter.year === null || y === filter.year
    if (filter.granularity === "quarter") return (filter.year === null || y === filter.year) && (filter.quarter === null || q === filter.quarter)
    if (filter.granularity === "month") return (filter.year === null || y === filter.year) && (filter.month === null || m === filter.month)
    return true
  })
}

export function filterLabel(filter: TimeFilter): string {
  if (filter.granularity === "all") return "All time"
  if (filter.granularity === "year" && filter.year) return `${filter.year}`
  if (filter.granularity === "quarter" && filter.year && filter.quarter) return `Q${filter.quarter} ${filter.year}`
  if (filter.granularity === "month" && filter.year && filter.month !== null) return `${MONTH_NAMES[filter.month]} ${filter.year}`
  return "All time"
}
