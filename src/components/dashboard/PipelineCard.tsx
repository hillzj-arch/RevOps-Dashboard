"use client"

import { useRef } from "react"
import { useDeals } from "@/lib/data/deals-context"
import { downloadAsPng } from "@/lib/chart-export"
import { calcPipeline } from "@/lib/calculations/pipeline"
import { FunnelChart } from "@/components/charts/FunnelChart"
import { DataTable } from "@/components/charts/DataTable"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n)

export function PipelineCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const { allDeals } = useDeals()
  const result = calcPipeline(allDeals)

  const openStages = result.stages.filter((s) => {
    const lower = s.stage.toLowerCase()
    return !lower.includes("won") && !lower.includes("lost")
  })
  const openDealCount = openStages.reduce((sum, s) => sum + s.count, 0)

  const funnelData = openStages.map((s) => ({ name: s.stage, value: s.count, sublabel: fmt(s.amount) }))

  return (
    <div ref={cardRef} className="relative group bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div className="flex items-start justify-between">
        <h2 className="text-base font-semibold text-gray-900">Open Pipeline Waterfall</h2>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">{fmt(result.totalPipelineValue)}</p>
          <p className="text-xs text-gray-500 mt-0.5">{openDealCount} deals</p>
          <p className="text-xs text-gray-500">{fmt(result.weightedForecast)} weighted</p>
        </div>
      </div>
      <FunnelChart data={funnelData} title="Deals by stage" height={280} />
      <DataTable
        data={openStages.map((s) => ({ stage: s.stage, count: s.count, amount: s.amount }))}
        columns={[
          { key: "stage", label: "Stage" },
          { key: "count", label: "Deals", align: "right" },
          { key: "amount", label: "Value", align: "right", format: (v) => fmt(Number(v)) },
        ]}
      />
      <button onClick={() => cardRef.current && downloadAsPng(cardRef.current, "pipeline-waterfall")} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-50" title="Download as PNG">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
    </div>
  )
}
