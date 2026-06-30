"use client"

import { useCopilotReadable, useCopilotAction, useCopilotContext } from "@copilotkit/react-core"
import { CopilotPopup } from "@copilotkit/react-ui"
import "@copilotkit/react-ui/styles.css"
import { useDeals } from "@/lib/data/deals-context"
import { calcWinRate } from "@/lib/calculations/win-rate"
import { calcGeographic } from "@/lib/calculations/geographic"
import { calcPipeline } from "@/lib/calculations/pipeline"
import { calcSalesCycle } from "@/lib/calculations/sales-cycle"
import { useState, useEffect } from "react"
import { BarChart } from "@/components/charts/BarChart"
import { LineChart } from "@/components/charts/LineChart"
import { FunnelChart } from "@/components/charts/FunnelChart"
import { DataTable } from "@/components/charts/DataTable"
import { AdminSettingsButton } from "@/components/admin/AdminSettingsModal"
import { type AISettings } from "@/lib/admin/settings"

interface GeneratedChart {
  id: string
  type: "bar" | "line" | "funnel" | "table"
  title: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: Record<string, any>
}

export function CopilotPanel({
  hasKey,
  onSettingsChange,
  onError,
}: {
  hasKey: boolean
  onSettingsChange: (s: AISettings) => void
  onError: (msg: string) => void
}) {
  const { deals } = useDeals()
  useCopilotContext() // keep provider subscription alive
  const [generatedCharts, setGeneratedCharts] = useState<GeneratedChart[]>([])

  // CopilotKit surfaces provider errors (401, 402, etc.) as RUN_ERROR SSE events
  // and handles them internally — the onError prop on <CopilotKit> is not called.
  // Intercept fetch to detect these events directly from the SSE stream.
  useEffect(() => {
    const orig = window.fetch

    function classifyAndReport(status: number | undefined, msg: string) {
      if (status === 402 || /credit|balance|quota|insufficient/i.test(msg)) {
        onError("Insufficient credits. Top up your API account or enter a different key in AI settings (⚙).")
      } else if (status === 401 || status === 403 || /key|auth|x-api-key|unauthorized|forbidden/i.test(msg)) {
        onError("API key is invalid or missing. Check your key in AI settings (⚙).")
      } else if (status === 429 || /rate.?limit|too many/i.test(msg)) {
        onError("Rate limit hit. Wait a moment, then try again.")
      } else if (msg) {
        onError(`AI assistant error: ${msg}`)
      }
    }

    window.fetch = async function (...args: Parameters<typeof fetch>) {
      const input = args[0]
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
          ? input.href
          : (input as Request).url ?? ""

      if (!url.includes("/api/copilotkit")) return orig.apply(window, args)

      let response: Response
      try {
        response = await orig.apply(window, args)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Network error"
        classifyAndReport(undefined, msg)
        throw err
      }

      // Non-2xx: our try-catch in the route returned a real HTTP error
      if (!response.ok) {
        response
          .clone()
          .json()
          .then((data: Record<string, string>) => {
            classifyAndReport(response.status, data?.error ?? data?.message ?? `HTTP ${response.status}`)
          })
          .catch(() => {})
        return response
      }

      // 200 with streaming body — parse SSE events for RUN_ERROR
      const clone = response.clone()
      const reader = clone.body?.getReader()
      if (reader) {
        const dec = new TextDecoder()
        ;(async () => {
          let buf = ""
          try {
            for (;;) {
              const { done, value } = await reader.read()
              if (done) break
              buf += dec.decode(value, { stream: true })
              const lines = buf.split("\n")
              buf = lines.pop() ?? ""
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue
                try {
                  const ev = JSON.parse(line.slice(6)) as { type?: string; message?: string; error?: { message?: string } }
                  if (ev.type === "RUN_ERROR") {
                    const msg = ev.error?.message ?? ev.message ?? "Unknown error"
                    classifyAndReport(undefined, msg)
                  }
                } catch { /* non-JSON lines are normal */ }
              }
            }
          } catch { /* stream aborted */ }
        })()
      }

      return response
    } as typeof fetch

    return () => { window.fetch = orig }
  }, [onError])

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
              <div key={chart.id} className="bg-white rounded-2xl border border-[var(--p-100)] p-6 relative">
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
      {hasKey ? (
        <CopilotPopup
          instructions="You are a RevOps analyst assistant. You have access to the current deals dataset. Use renderBarChart, renderLineChart, renderFunnelChart, or renderTable to create visualizations when the user asks for charts or analysis. Always ground your answers in the actual data provided. Be concise and specific."
          labels={{ title: "RevOps Assistant", initial: "Ask me anything about your pipeline, win rates, or sales cycle — or ask me to build a chart." }}
        />
      ) : (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl px-8 py-10 flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--p-50)] flex items-center justify-center">
            <svg className="w-6 h-6 text-[var(--p-400)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800">Connect your AI assistant</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Add your Anthropic or OpenAI API key to enable AI-powered pipeline analysis and chart generation. Your key stays in your browser only.
            </p>
          </div>
          <AdminSettingsButton onSettingsChange={onSettingsChange} />
          <p className="text-xs text-gray-400">Click the settings icon above, or use the ⚙ icon in the header</p>
        </div>
      )}
    </>
  )
}
