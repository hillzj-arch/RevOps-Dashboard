"use client"

import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"
import { useDeals } from "@/lib/data/deals-context"
import { calcWinRate } from "@/lib/calculations/win-rate"
import { calcGeographic } from "@/lib/calculations/geographic"
import { calcPipeline } from "@/lib/calculations/pipeline"
import { calcSalesCycle } from "@/lib/calculations/sales-cycle"
import { useState } from "react"
import { BarChart } from "@/components/charts/BarChart"
import { LineChart } from "@/components/charts/LineChart"
import { FunnelChart } from "@/components/charts/FunnelChart"
import { DataTable } from "@/components/charts/DataTable"

interface GeneratedChart {
  id: string
  type: "bar" | "line" | "funnel" | "table"
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
}

export function CopilotPanel() {
  const { deals } = useDeals()
  const [generatedCharts, setGeneratedCharts] = useState<GeneratedChart[]>([])

  const winRate = calcWinRate(deals)
  const geo = calcGeographic(deals)
  const pipeline = calcPipeline(deals)
  const cycle = calcSalesCycle(deals)

  useCopilotReadable({
    description: "Current RevOps data summary",
    value: {
      totalDeals: deals.length,
      winRate: winRate.winRate,
      wonDeals: winRate.won,
      lostDeals: winRate.lost,
      openDeals: winRate.open,
      avgSalesCycleDays: cycle.avgTotalDays,
      totalPipelineValue: pipeline.totalPipelineValue,
      weightedForecast: pipeline.weightedForecast,
      pipelineByStage: pipeline.stages,
      winRateByRegion: winRate.winRateByRegion,
      winRateByDealType: winRate.winRateByDealType,
      dealsByRegion: geo.byRegion,
      dealsByCountry: geo.topCountries,
      salesCycleByStage: cycle.byStageName,
      salesCycleTrend: cycle.trend,
    },
  })

  useCopilotAction({
    name: "renderBarChart",
    description: "Render a bar chart from the deals data",
    parameters: [
      { name: "title", type: "string", description: "Chart title" },
      { name: "data", type: "object[]", description: "Array of data objects", attributes: [{ name: "label", type: "string" }, { name: "value", type: "number" }] },
      { name: "xKey", type: "string", description: "Key for x-axis labels" },
      { name: "valueKey", type: "string", description: "Key for bar values" },
      { name: "formatAsCurrency", type: "boolean", description: "Format values as USD", required: false },
      { name: "formatAsPercent", type: "boolean", description: "Format values as percentage", required: false },
    ],
    handler: ({ title, data, xKey, valueKey, formatAsCurrency, formatAsPercent }) => {
      setGeneratedCharts((prev) => [...prev, { id: `chart-${Date.now()}`, type: "bar", title, props: { data, xKey, valueKey, formatAsCurrency, formatAsPercent } }])
      return `Bar chart "${title}" added to the dashboard.`
    },
  })

  useCopilotAction({
    name: "renderLineChart",
    description: "Render a line chart showing trends over time",
    parameters: [
      { name: "title", type: "string", description: "Chart title" },
      { name: "data", type: "object[]", description: "Array of data objects", attributes: [{ name: "label", type: "string" }, { name: "value", type: "number" }] },
      { name: "xKey", type: "string", description: "Key for x-axis" },
      { name: "valueKey", type: "string", description: "Key for line values" },
    ],
    handler: ({ title, data, xKey, valueKey }) => {
      setGeneratedCharts((prev) => [...prev, { id: `chart-${Date.now()}`, type: "line", title, props: { data, xKey, valueKey } }])
      return `Line chart "${title}" added to the dashboard.`
    },
  })

  useCopilotAction({
    name: "renderFunnelChart",
    description: "Render a funnel chart for pipeline stages",
    parameters: [
      { name: "title", type: "string", description: "Chart title" },
      { name: "data", type: "object[]", description: "Funnel stages", attributes: [{ name: "name", type: "string" }, { name: "value", type: "number" }] },
    ],
    handler: ({ title, data }) => {
      setGeneratedCharts((prev) => [...prev, { id: `chart-${Date.now()}`, type: "funnel", title, props: { data } }])
      return `Funnel chart "${title}" added to the dashboard.`
    },
  })

  useCopilotAction({
    name: "renderTable",
    description: "Render a data table",
    parameters: [
      { name: "title", type: "string", description: "Table title" },
      { name: "rows", type: "object[]", description: "Table rows" },
      { name: "columns", type: "object[]", description: "Column definitions", attributes: [{ name: "key", type: "string" }, { name: "label", type: "string" }, { name: "align", type: "string", required: false }] },
    ],
    handler: ({ title, rows, columns }) => {
      setGeneratedCharts((prev) => [...prev, { id: `chart-${Date.now()}`, type: "table", title, props: { rows, columns } }])
      return `Table "${title}" added to the dashboard.`
    },
  })

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 1 }).format(v)

  return (
    <>
      {generatedCharts.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">AI-Generated Views</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {generatedCharts.map((chart) => (
              <div key={chart.id} className="bg-white rounded-2xl border border-indigo-100 p-6 relative">
                <button onClick={() => setGeneratedCharts((prev) => prev.filter((c) => c.id !== chart.id))} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 text-lg leading-none" title="Remove">×</button>
                {chart.type === "bar" && <BarChart title={chart.title} data={chart.props.data} xKey={chart.props.xKey} bars={[{ key: chart.props.valueKey }]} formatValue={chart.props.formatAsCurrency ? fmtCurrency : chart.props.formatAsPercent ? (v) => `${v}%` : undefined} />}
                {chart.type === "line" && <LineChart title={chart.title} data={chart.props.data} xKey={chart.props.xKey} lines={[{ key: chart.props.valueKey }]} />}
                {chart.type === "funnel" && <FunnelChart title={chart.title} data={chart.props.data} />}
                {chart.type === "table" && <DataTable title={chart.title} data={chart.props.rows} columns={chart.props.columns} />}
              </div>
            ))}
          </div>
        </div>
      )}
      <CopilotPopup
        instructions="You are a RevOps analyst assistant. You have access to the current deals dataset. Use renderBarChart, renderLineChart, renderFunnelChart, or renderTable to create visualizations when the user asks for charts or analysis. Always ground your answers in the actual data provided. Be concise and specific."
        labels={{ title: "RevOps Assistant", initial: "Ask me anything about your pipeline, win rates, or sales cycle — or ask me to build a chart." }}
      />
    </>
  )
}
