"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcRepRevenue } from "@/lib/calculations/rep-revenue"
import { useTheme } from "@/lib/theme-context"

const fmtCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n)

export function RepRevenueCard() {
  const { deals } = useDeals()
  const { primaryColor } = useTheme()
  const { rows, totalRevenue, totalDeals } = calcRepRevenue(deals)

  const maxRevenue = rows[0]?.revenue ?? 1

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Rep Revenue Ranking</h2>
          <p className="text-xs text-gray-500 mt-0.5">Closed won deals only</p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-gray-900">{fmtCurrency(totalRevenue)}</span>
          <p className="text-xs text-gray-500 mt-1">{totalDeals} closed won deals</p>
        </div>
      </div>

      <div className="space-y-3">
        {rows.map((row) => {
          const pct = maxRevenue > 0 ? (row.revenue / maxRevenue) * 100 : 0
          return (
            <div key={row.rep} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-semibold text-gray-400 w-5 shrink-0">#{row.rank}</span>
                  <span className="font-medium text-gray-800 truncate">{row.rep}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-xs text-gray-400">{row.deals} deals</span>
                  <span className="font-semibold text-gray-900 w-16 text-right">{fmtCurrency(row.revenue)}</span>
                </div>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: primaryColor }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
