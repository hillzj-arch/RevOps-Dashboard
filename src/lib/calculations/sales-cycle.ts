import { Deal, STAGE_ORDER } from "../data/schema"

export interface StageCycleTime {
  stage: string
  avgDays: number
  medianDays: number
}

export interface SalesCycleResult {
  avgTotalDays: number
  medianTotalDays: number
  byStageName: StageCycleTime[]
  byDealType: { dealType: string; avgDays: number }[]
  byRegion: { region: string; avgDays: number }[]
  trend: { month: string; avgDays: number }[]
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

export function calcSalesCycle(deals: Deal[]): SalesCycleResult {
  const wonDeals = deals.filter((d) => d.dealStage.toLowerCase().includes("won"))

  const stageFields: { name: string; key: keyof Deal }[] = STAGE_ORDER.map((s) => ({
    name: s,
    key: s.toLowerCase() as keyof Deal,
  }))

  const allDays = wonDeals.map((d) => d.salesCycleDays).filter((v) => v > 0)

  const byStageName = stageFields.map((f) => {
    const vals = wonDeals.map((d) => Number(d[f.key]) || 0).filter((v) => v > 0)
    return {
      stage: f.name,
      avgDays: vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0,
      medianDays: Math.round(median(vals)),
    }
  })

  const typeMap: Record<string, number[]> = {}
  const regionMap: Record<string, number[]> = {}
  const monthMap: Record<string, number[]> = {}

  for (const deal of wonDeals) {
    const days = deal.salesCycleDays
    if (!days) continue

    const type = deal.dealType || "Unknown"
    const region = deal.region || "Unknown"
    if (!typeMap[type]) typeMap[type] = []
    if (!regionMap[region]) regionMap[region] = []
    typeMap[type].push(days)
    regionMap[region].push(days)

    if (deal.closeDate) {
      const month = deal.closeDate.toISOString().slice(0, 7)
      if (!monthMap[month]) monthMap[month] = []
      monthMap[month].push(days)
    }
  }

  const avg = (nums: number[]) =>
    nums.length > 0 ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0

  return {
    avgTotalDays: avg(allDays),
    medianTotalDays: Math.round(median(allDays)),
    byStageName,
    byDealType: Object.entries(typeMap)
      .map(([dealType, days]) => ({ dealType, avgDays: avg(days) }))
      .sort((a, b) => b.avgDays - a.avgDays),
    byRegion: Object.entries(regionMap)
      .map(([region, days]) => ({ region, avgDays: avg(days) }))
      .sort((a, b) => b.avgDays - a.avgDays),
    trend: Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, days]) => ({ month, avgDays: avg(days) })),
  }
}
