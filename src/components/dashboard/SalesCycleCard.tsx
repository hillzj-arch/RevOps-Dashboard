"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcSalesCycle } from "@/lib/calculations/sales-cycle"
import { BarChart } from "@/components/charts/BarChart"
import { LineChart } from "@/components/charts/LineChart"
import { useTheme } from "@/lib/theme-context"

export function SalesCycleCard() {
  const { deals } = useDeals()
  const { primaryColor } = useTheme()
  const result = calcSalesCycle(deals)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-base font-semibold text-gray-900">Sales Cycle</h2>
        <div className="text-right">
          <span className="text-4xl font-bold text-[var(--p-600)]">{result.avgTotalDays}d</span>
          <p className="text-xs text-gray-500 mt-1">avg · {result.medianTotalDays}d median</p>
        </div>
      </div>
      <BarChart
        data={result.byStageName.map((s) => ({ stage: s.stage, "Avg Days": s.avgDays }))}
        xKey="stage"
        bars={[{ key: "Avg Days", color: primaryColor }]}
        title="Average days per stage"
        height={200}
      />
      {result.trend.length > 1 && (
        <LineChart
          data={result.trend.map((t) => ({ month: t.month.slice(5), "Avg Days": t.avgDays }))}
          xKey="month"
          lines={[{ key: "Avg Days", color: "#10b981" }]}
          title="Sales cycle trend (by close month)"
          height={180}
        />
      )}
      {result.byDealType.length > 1 && (
        <BarChart
          data={result.byDealType.map((d) => ({ type: d.dealType, "Avg Days": d.avgDays }))}
          xKey="type"
          bars={[{ key: "Avg Days", color: "#f59e0b" }]}
          title="Cycle time by deal type"
          height={160}
        />
      )}
    </div>
  )
}
