"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcPipeline } from "@/lib/calculations/pipeline"
import { FunnelChart } from "@/components/charts/FunnelChart"
import { DataTable } from "@/components/charts/DataTable"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(n)

export function PipelineCard() {
  const { deals } = useDeals()
  const result = calcPipeline(deals)

  const openStages = result.stages.filter((s) => s.stage !== "Closed Won" && s.stage !== "Closed Lost")
  const openDealCount = openStages.reduce((sum, s) => sum + s.count, 0)

  const funnelData = openStages.map((s) => ({ name: s.stage, value: s.count, sublabel: fmt(s.amount) }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
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
        data={result.stages.map((s) => ({ stage: s.stage, count: s.count, amount: s.amount }))}
        columns={[
          { key: "stage", label: "Stage" },
          { key: "count", label: "Deals", align: "right" },
          { key: "amount", label: "Value", align: "right", format: (v) => fmt(Number(v)) },
        ]}
      />
    </div>
  )
}
