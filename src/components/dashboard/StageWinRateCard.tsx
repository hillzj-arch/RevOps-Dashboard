"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcStageWinRates } from "@/lib/calculations/win-rate"
import { FunnelChart } from "@/components/charts/FunnelChart"

export function StageWinRateCard() {
  const { deals } = useDeals()
  const rows = calcStageWinRates(deals)

  const totalWon = rows[0]?.won ?? 0

  const funnelData = rows.map((r) => ({
    name: r.stage,
    value: r.winRate,
    sublabel: `${r.won} won of ${r.closed} closed`,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Win Rate by Stage</h2>
          <p className="text-xs text-gray-500 mt-0.5">Closed Won deals that passed through each stage</p>
        </div>
        <span className="text-4xl font-bold text-indigo-600">{totalWon}</span>
      </div>
      <FunnelChart data={funnelData} formatValue={(v) => `${v}%`} height={280} />
    </div>
  )
}
