import { Deal } from "../data/schema"

export interface RepRevenueRow {
  rank: number
  rep: string
  revenue: number
  deals: number
  avgDealSize: number
}

export interface RepRevenueResult {
  rows: RepRevenueRow[]
  totalRevenue: number
  totalDeals: number
}

export function calcRepRevenue(deals: Deal[]): RepRevenueResult {
  const wonDeals = deals.filter((d) => d.dealStage === "Closed Won")

  const map: Record<string, { revenue: number; deals: number }> = {}
  for (const deal of wonDeals) {
    const rep = deal.dealOwner || "Unknown"
    if (!map[rep]) map[rep] = { revenue: 0, deals: 0 }
    map[rep].revenue += deal.amount
    map[rep].deals++
  }

  const rows: RepRevenueRow[] = Object.entries(map)
    .map(([rep, v]) => ({
      rep,
      revenue: v.revenue,
      deals: v.deals,
      avgDealSize: v.deals > 0 ? Math.round(v.revenue / v.deals) : 0,
      rank: 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .map((row, i) => ({ ...row, rank: i + 1 }))

  return {
    rows,
    totalRevenue: wonDeals.reduce((sum, d) => sum + d.amount, 0),
    totalDeals: wonDeals.length,
  }
}
