"use client"

import { createContext, useContext, useState, useMemo, ReactNode } from "react"
import { Deal } from "./schema"
import { DEMO_DEALS } from "./demo-data"
import { TimeFilter, DEFAULT_TIME_FILTER, applyTimeFilter } from "./time-filter"

interface DealsContextValue {
  deals: Deal[]        // filtered — used by all tiles except pipeline waterfall
  allDeals: Deal[]     // unfiltered — used by pipeline waterfall only
  setDeals: (deals: Deal[]) => void
  isDemo: boolean
  resetToDemo: () => void
  timeFilter: TimeFilter
  setTimeFilter: (f: TimeFilter) => void
}

const DealsContext = createContext<DealsContextValue | null>(null)

export function DealsProvider({ children }: { children: ReactNode }) {
  const [rawDeals, setRawDeals] = useState<Deal[]>(DEMO_DEALS)
  const [isDemo, setIsDemo] = useState(true)
  const [timeFilter, setTimeFilter] = useState<TimeFilter>(DEFAULT_TIME_FILTER)

  function setDeals(newDeals: Deal[]) {
    setRawDeals(newDeals)
    setIsDemo(false)
    setTimeFilter(DEFAULT_TIME_FILTER)
  }

  function resetToDemo() {
    setRawDeals(DEMO_DEALS)
    setIsDemo(true)
    setTimeFilter(DEFAULT_TIME_FILTER)
  }

  const deals = useMemo(() => applyTimeFilter(rawDeals, timeFilter), [rawDeals, timeFilter])

  return (
    <DealsContext.Provider value={{ deals, allDeals: rawDeals, setDeals, isDemo, resetToDemo, timeFilter, setTimeFilter }}>
      {children}
    </DealsContext.Provider>
  )
}

export function useDeals() {
  const ctx = useContext(DealsContext)
  if (!ctx) throw new Error("useDeals must be used within DealsProvider")
  return ctx
}
