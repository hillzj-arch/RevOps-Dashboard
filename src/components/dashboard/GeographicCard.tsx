"use client"

import { useDeals } from "@/lib/data/deals-context"
import { calcGeographic } from "@/lib/calculations/geographic"
import { BarChart } from "@/components/charts/BarChart"
import { DataTable } from "@/components/charts/DataTable"
import { useTheme } from "@/lib/theme-context"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact" }).format(n)

export function GeographicCard() {
  const { deals } = useDeals()
  const { primaryColor } = useTheme()
  const result = calcGeographic(deals)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
      <h2 className="text-base font-semibold text-gray-900">Geographic Distribution</h2>
      <BarChart
        data={result.byRegion.map((r) => ({ region: r.region, Deals: r.count }))}
        xKey="region"
        bars={[{ key: "Deals", color: primaryColor }]}
        title="Deals by region"
        height={200}
      />
      <DataTable
        data={result.topCountries}
        columns={[
          { key: "country", label: "Country" },
          { key: "count", label: "Deals", align: "right" },
          { key: "amount", label: "Total Value", align: "right", format: (v) => fmt(Number(v)) },
        ]}
        title="Top countries"
        maxRows={8}
      />
    </div>
  )
}
