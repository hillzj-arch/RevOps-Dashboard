"use client"

import { useRef } from "react"
import { useDeals } from "@/lib/data/deals-context"
import { downloadAsPng } from "@/lib/chart-export"
import { calcWinRate } from "@/lib/calculations/win-rate"
import { BarChart } from "@/components/charts/BarChart"
import { useTheme } from "@/lib/theme-context"

export function WinRateCard() {
  const { deals } = useDeals()
  const { primaryColor } = useTheme()
  const cardRef = useRef<HTMLDivElement>(null)
  const result = calcWinRate(deals)

  return (
    <div ref={cardRef} className="relative group bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Win Rate</h2>
          <p className="text-xs text-gray-500 mt-0.5">Closed deals only</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-gray-900">{result.winRate}%</span>
          <p className="text-xs text-gray-500 mt-1">{result.won}W / {result.lost}L / {result.open} open</p>
        </div>
      </div>

      <BarChart
        data={result.winRateByRegion.map((r) => ({ region: r.region, "Win Rate %": r.rate }))}
        xKey="region"
        bars={[{ key: "Win Rate %", color: primaryColor }]}
        title="Win rate by region"
        formatValue={(v) => `${v}%`}
        showLabels
        height={200}
      />

      <BarChart
        data={result.winRateByOwner.map((o) => ({ rep: o.owner.split(" ")[0], "Win Rate %": o.rate }))}
        xKey="rep"
        bars={[{ key: "Win Rate %", color: primaryColor }]}
        title="Win rate by rep"
        formatValue={(v) => `${v}%`}
        showLabels
        height={200}
      />
      <button onClick={() => cardRef.current && downloadAsPng(cardRef.current, "win-rate")} data-export-ignore="true" className="absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50" title="Download as PNG">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
    </div>
  )
}
