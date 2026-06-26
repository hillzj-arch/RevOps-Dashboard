"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { Deal } from "./schema"
import { DEMO_DEALS } from "./demo-data"

interface DealsContextValue {
  deals: Deal[]
  setDeals: (deals: Deal[]) => void
  isDemo: boolean
  resetToDemo: () => void
}

const DealsContext = createContext<DealsContextValue | null>(null)

export function DealsProvider({ children }: { children: ReactNode }) {
  const [deals, setDealsState] = useState<Deal[]>(DEMO_DEALS)
  const [isDemo, setIsDemo] = useState(true)

  function setDeals(newDeals: Deal[]) {
    setDealsState(newDeals)
    setIsDemo(false)
  }

  function resetToDemo() {
    setDealsState(DEMO_DEALS)
    setIsDemo(true)
  }

  return (
    <DealsContext.Provider value={{ deals, setDeals, isDemo, resetToDemo }}>
      {children}
    </DealsContext.Provider>
  )
}

export function useDeals() {
  const ctx = useContext(DealsContext)
  if (!ctx) throw new Error("useDeals must be used within DealsProvider")
  return ctx
}
