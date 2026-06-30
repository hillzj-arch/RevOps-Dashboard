"use client"

import { useState, useMemo, useRef } from "react"
import { downloadAsPng } from "@/lib/chart-export"
import { useDeals } from "@/lib/data/deals-context"
import { calcClosedLostReasons } from "@/lib/calculations/closed-lost-reasons"
import { PieChart } from "@/components/charts/PieChart"

export function ClosedLostReasonsCard() {
  const { deals } = useDeals()
  const cardRef = useRef<HTMLDivElement>(null)
  const [region, setRegion] = useState("")
  const [rep, setRep] = useState("")

  const lostDeals = useMemo(
    () => deals.filter((d) => d.dealStage.toLowerCase().includes("lost")),
    [deals]
  )

  const regions = useMemo(
    () => [...new Set(lostDeals.map((d) => d.region).filter(Boolean))].sort(),
    [lostDeals]
  )

  const reps = useMemo(() => {
    const source = region ? lostDeals.filter((d) => d.region === region) : lostDeals
    return [...new Set(source.map((d) => d.dealOwner).filter(Boolean))].sort()
  }, [lostDeals, region])

  const filtered = useMemo(() => {
    let result = deals
    if (region) result = result.filter((d) => d.region === region)
    if (rep) result = result.filter((d) => d.dealOwner === rep)
    return result
  }, [deals, region, rep])

  const reasons = calcClosedLostReasons(filtered)
  const total = reasons.reduce((s, r) => s + r.count, 0)

  function handleRegionChange(val: string) {
    setRegion(val)
    setRep("")
  }

  return (
    <div ref={cardRef} className="relative group bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">Closed Lost Reasons</h2>
          <p className="text-xs text-gray-500 mt-0.5">Why deals are lost</p>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-red-500">{total}</span>
          <p className="text-xs text-gray-500 mt-1">lost deals</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={region}
          onChange={(e) => handleRegionChange(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--p)]"
        >
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          value={rep}
          onChange={(e) => setRep(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--p)]"
        >
          <option value="">All reps</option>
          {reps.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {(region || rep) && (
          <button
            onClick={() => { setRegion(""); setRep("") }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {total === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No lost deals in this period</p>
      ) : (
        <>
          <PieChart
            data={reasons.map((r) => ({ name: r.reason, value: r.count }))}
            formatValue={(v) => `${v} deals`}
            height={260}
          />
          <div className="grid grid-cols-2 gap-2">
            {reasons.map((r) => (
              <div key={r.reason} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <span className="font-medium truncate mr-2">{r.reason}</span>
                <span className="text-gray-400 shrink-0">{r.count} · {r.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
      <button onClick={() => cardRef.current && downloadAsPng(cardRef.current, "closed-lost-reasons")} data-export-ignore="true" className="absolute bottom-3 right-3 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50" title="Download as PNG">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
      </button>
    </div>
  )
}
