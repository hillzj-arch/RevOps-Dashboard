"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcStageConversions } from "@/lib/calculations/pipeline"
import { FunnelChart } from "@/components/charts/FunnelChart"

export function StageConversionCard() {
  const { deals } = useDeals()
  const rows = calcStageConversions(deals)

  const funnelData = rows.map((r) => ({
    name: r.stage,
    value: r.rate,
    sublabel: `${r.count} of ${r.prevCount} from prev`,
  }))

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <div>
        <h2 className="text-base font-semibold text-gray-900">Stage Conversion</h2>
        <p className="text-xs text-gray-500 mt-0.5">% of deals advancing from each stage to the next</p>
      </div>
      <FunnelChart data={funnelData} formatValue={(v) => `${v}%`} height={280} />
    </div>
  )
}
