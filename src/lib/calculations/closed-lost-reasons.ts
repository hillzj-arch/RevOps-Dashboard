import { Deal } from "../data/schema"

export interface ClosedLostReasonRow {
  reason: string
  count: number
  percentage: number
}

export function calcClosedLostReasons(deals: Deal[]): ClosedLostReasonRow[] {
  const lost = deals.filter((d) => d.dealStage.toLowerCase().includes("lost"))
  const counts: Record<string, number> = {}

  for (const deal of lost) {
    const reason = deal.closeLostReason?.trim() || "Unknown"
    counts[reason] = (counts[reason] ?? 0) + 1
  }

  const total = lost.length
  return Object.entries(counts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
}
