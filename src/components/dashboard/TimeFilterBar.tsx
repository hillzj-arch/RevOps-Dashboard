"use client"

import { useDeals } from "@/lib/data/deals-context"
import { TimeGranularity, getAvailablePeriods, PeriodOption } from "@/lib/data/time-filter"
import { useMemo } from "react"

const GRANULARITIES: { id: TimeGranularity; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "year", label: "Year" },
  { id: "quarter", label: "Quarter" },
  { id: "month", label: "Month" },
]

export function TimeFilterBar() {
  const { allDeals, timeFilter, setTimeFilter } = useDeals()

  const periods = useMemo(() => getAvailablePeriods(allDeals), [allDeals])

  const options: PeriodOption[] =
    timeFilter.granularity === "year" ? periods.years
    : timeFilter.granularity === "quarter" ? periods.quarters
    : timeFilter.granularity === "month" ? periods.months
    : []

  function setGranularity(granularity: TimeGranularity) {
    if (granularity === "all") {
      setTimeFilter({ granularity: "all", year: null, quarter: null, month: null })
      return
    }
    // Auto-select the most recent period for the chosen granularity
    const opts =
      granularity === "year" ? periods.years
      : granularity === "quarter" ? periods.quarters
      : periods.months
    const latest = opts[opts.length - 1]
    if (!latest) {
      setTimeFilter({ granularity, year: null, quarter: null, month: null })
      return
    }
    setTimeFilter({
      granularity,
      year: latest.year,
      quarter: latest.quarter ?? null,
      month: latest.month ?? null,
    })
  }

  function selectPeriod(value: string) {
    const opt = options.find((o) => o.value === value)
    if (!opt) return
    setTimeFilter({
      granularity: timeFilter.granularity,
      year: opt.year,
      quarter: opt.quarter ?? null,
      month: opt.month ?? null,
    })
  }

  function currentValue(): string {
    const { granularity, year, quarter, month } = timeFilter
    if (granularity === "year" && year !== null) return `${year}`
    if (granularity === "quarter" && year !== null && quarter !== null) return `${year}-${quarter}`
    if (granularity === "month" && year !== null && month !== null) return `${year}-${month}`
    return ""
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Time period</span>
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
        {GRANULARITIES.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setGranularity(id)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              timeFilter.granularity === id
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {timeFilter.granularity !== "all" && options.length > 0 && (
        <select
          value={currentValue()}
          onChange={(e) => selectPeriod(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
      <span className="text-xs text-gray-400 italic">Pipeline waterfall always shows current open deals</span>
    </div>
  )
}
