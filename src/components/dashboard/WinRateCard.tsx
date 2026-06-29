"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcWinRate } from "@/lib/calculations/win-rate"
import { BarChart } from "@/components/charts/BarChart"
import { useTheme } from "@/lib/theme-context"

export function WinRateCard() {
  const { deals } = useDeals()
  const { primaryColor } = useTheme()
  const result = calcWinRate(deals)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Win Rate</h2>
          <p className="text-xs text-gray-500 mt-0.5">Closed deals only</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-[var(--p-600)]">{result.winRate}%</span>
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
    </div>
  )
}
