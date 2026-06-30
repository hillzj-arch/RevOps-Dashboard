"use client"

import { useRef } from "react"
import { useDeals } from "@/lib/data/deals-context"
import { downloadAsPng } from "@/lib/chart-export"
import { calcStageWinRates } from "@/lib/calculations/win-rate"
import { FunnelChart } from "@/components/charts/FunnelChart"

export function StageWinRateCard() {
  const { deals } = useDeals()
  const cardRef = useRef<HTMLDivElement>(null)
  const rows = calcStageWinRates(deals)

  const totalWon = rows[0]?.won ?? 0

  const funnelData = rows.map((r) => ({
    name: r.stage,
    value: r.winRate,
    sublabel: `${r.won} won of ${r.closed} closed`,
  }))

  return (
    <div ref={cardRef} className="relative group bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Win Rate by Stage</h2>
          <p className="text-xs text-gray-500 mt-0.5">Closed Won deals that passed through each stage</p>
        </div>
        <span className="text-4xl font-bold text-gray-900">{totalWon}</span>
      </div>
      <FunnelChart data={funnelData} formatValue={(v) => `${v}%`} height={280} />
      <button onClick={() => cardRef.current && downloadAsPng(cardRef.current, "stage-win-rate")} className="absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50" title="Download as PNG">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
    </div>
  )
}
