import { Deal } from "../data/schema"

export interface QuarterPoint {
  quarter: string
  value: number
}

export interface TrendsResult {
  wonRevenue: QuarterPoint[]
  winRate: QuarterPoint[]
  createdCount: QuarterPoint[]
  createdAmount: QuarterPoint[]
}

function toQuarterKey(date: Date): string {
  const q = Math.floor(date.getMonth() / 3) + 1
  return `${date.getFullYear()} Q${q}`
}

function sortedPoints(map: Record<string, number>): QuarterPoint[] {
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, value]) => ({ quarter, value }))
}

export function calcTrends(deals: Deal[], region?: string): TrendsResult {
  const src = region ? deals.filter((d) => d.region === region) : deals

  const wonRevMap: Record<string, number> = {}
  const closedMap: Record<string, { won: number; total: number }> = {}
  const createdCountMap: Record<string, number> = {}
  const createdAmountMap: Record<string, number> = {}

  for (const deal of src) {
    const isWon = deal.dealStage.toLowerCase().includes("won")
    const isLost = deal.dealStage.toLowerCase().includes("lost")

    if (deal.closeDate) {
      const closeQtr = toQuarterKey(deal.closeDate)

      if (isWon) {
        wonRevMap[closeQtr] = (wonRevMap[closeQtr] ?? 0) + deal.amount
      }

      if (isWon || isLost) {
        if (!closedMap[closeQtr]) closedMap[closeQtr] = { won: 0, total: 0 }
        closedMap[closeQtr].total++
        if (isWon) closedMap[closeQtr].won++
      }

      // Approximate deal creation date from close date minus sales cycle
      if (deal.salesCycleDays > 0) {
        const createDate = new Date(deal.closeDate.getTime() - deal.salesCycleDays * 86400000)
        const createQtr = toQuarterKey(createDate)
        createdCountMap[createQtr] = (createdCountMap[createQtr] ?? 0) + 1
        createdAmountMap[createQtr] = (createdAmountMap[createQtr] ?? 0) + deal.amount
      }
    }
  }

  const winRate = Object.entries(closedMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([quarter, { won, total }]) => ({
      quarter,
      value: total > 0 ? Math.round((won / total) * 100) : 0,
    }))

  return {
    wonRevenue: sortedPoints(wonRevMap),
    winRate,
    createdCount: sortedPoints(createdCountMap),
    createdAmount: sortedPoints(createdAmountMap),
  }
}
