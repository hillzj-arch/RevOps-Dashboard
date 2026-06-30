"use client"

import { useRef, useState, useMemo } from "react"
import { useDeals } from "@/lib/data/deals-context"
import { calcTrends } from "@/lib/calculations/trends"
import { LineChart } from "@/components/charts/LineChart"
import { downloadAsPng } from "@/lib/chart-export"

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(v)

export function WonTrendsCard() {
  const { deals } = useDeals()
  const cardRef = useRef<HTMLDivElement>(null)
  const [region, setRegion] = useState("")

  const regions = useMemo(
    () => [...new Set(deals.map((d) => d.region).filter(Boolean))].sort(),
    [deals]
  )

  const { wonRevenue, winRate } = useMemo(() => calcTrends(deals, region || undefined), [deals, region])

  const revenueData = wonRevenue.map((p) => ({ quarter: p.quarter, "Won Revenue": p.value }))
  const winRateData = winRate.map((p) => ({ quarter: p.quarter, "Win Rate %": p.value }))

  return (
    <div ref={cardRef} className="relative group bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Won Trends</h2>
          <p className="text-xs text-gray-500 mt-0.5">Revenue and win rate by quarter</p>
        </div>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--p)]"
        >
          <option value="">All regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <LineChart
        data={revenueData}
        xKey="quarter"
        lines={[{ key: "Won Revenue" }]}
        title="Closed won revenue"
        formatValue={fmtCurrency}
        height={150}
      />

      <LineChart
        data={winRateData}
        xKey="quarter"
        lines={[{ key: "Win Rate %" }]}
        title="Win rate"
        formatValue={(v) => `${v}%`}
        height={150}
      />

      <button
        data-export-ignore="true"
        onClick={() => cardRef.current && downloadAsPng(cardRef.current, "won-trends")}
        className="absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        title="Download as PNG"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
    </div>
  )
}
