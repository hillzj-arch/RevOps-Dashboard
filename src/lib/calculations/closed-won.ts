import { Deal } from "../data/schema"

export interface ClosedWonRegionRow {
  region: string
  revenue: number
  deals: number
}

export interface ClosedWonResult {
  totalRevenue: number
  totalDeals: number
  byRegion: ClosedWonRegionRow[]
}

export function calcClosedWon(deals: Deal[]): ClosedWonResult {
  const wonDeals = deals.filter((d) => d.dealStage.toLowerCase().includes("won"))

  const regionMap: Record<string, { revenue: number; deals: number }> = {}
  for (const deal of wonDeals) {
    const region = deal.region || "Unknown"
    if (!regionMap[region]) regionMap[region] = { revenue: 0, deals: 0 }
    regionMap[region].revenue += deal.amount
    regionMap[region].deals++
  }

  const byRegion = Object.entries(regionMap)
    .map(([region, v]) => ({ region, revenue: v.revenue, deals: v.deals }))
    .sort((a, b) => b.revenue - a.revenue)

  return {
    totalRevenue: wonDeals.reduce((s, d) => s + d.amount, 0),
    totalDeals: wonDeals.length,
    byRegion,
  }
}
