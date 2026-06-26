import { Deal, STAGE_ORDER } from "../data/schema"

export interface StageWinRateRow {
  stage: string
  won: number
  closed: number
  winRate: number
}

export function calcStageWinRates(deals: Deal[]): StageWinRateRow[] {
  return STAGE_ORDER.map((stage) => {
    const key = stage.toLowerCase() as keyof Deal
    const inStage = deals.filter((d) => Number(d[key]) > 0)
    const won = inStage.filter((d) => d.dealStage === "Closed Won").length
    const lost = inStage.filter((d) => d.dealStage === "Closed Lost").length
    const closed = won + lost
    return { stage, won, closed, winRate: closed > 0 ? Math.round((won / closed) * 100) : 0 }
  })
}

export interface WinRateResult {
  total: number
  won: number
  lost: number
  open: number
  winRate: number
  winRateByDealType: { dealType: string; won: number; total: number; rate: number }[]
  winRateByRegion: { region: string; won: number; total: number; rate: number }[]
  winRateByOwner: { owner: string; won: number; total: number; rate: number }[]
}

function groupWinRate<K extends string>(
  deals: Deal[],
  keyFn: (d: Deal) => K
): { [key: string]: { won: number; total: number; rate: number } } {
  const map: Record<string, { won: number; total: number }> = {}
  for (const deal of deals) {
    const key = keyFn(deal) || "Unknown"
    if (!map[key]) map[key] = { won: 0, total: 0 }
    map[key].total++
    if (deal.dealStage.toLowerCase().includes("won")) map[key].won++
  }
  return Object.fromEntries(
    Object.entries(map).map(([k, v]) => [
      k,
      { ...v, rate: v.total > 0 ? Math.round((v.won / v.total) * 100) : 0 },
    ])
  )
}

export function calcWinRate(deals: Deal[]): WinRateResult {
  const closed = deals.filter(
    (d) =>
      d.dealStage.toLowerCase().includes("closed") ||
      d.dealStage.toLowerCase().includes("won") ||
      d.dealStage.toLowerCase().includes("lost")
  )
  const won = closed.filter((d) => d.dealStage.toLowerCase().includes("won")).length
  const lost = closed.filter((d) => d.dealStage.toLowerCase().includes("lost")).length
  const open = deals.length - closed.length

  const byType = groupWinRate(closed, (d) => d.dealType)
  const byRegion = groupWinRate(closed, (d) => d.region)
  const byOwner = groupWinRate(closed, (d) => d.dealOwner)

  return {
    total: deals.length,
    won,
    lost,
    open,
    winRate: closed.length > 0 ? Math.round((won / closed.length) * 100) : 0,
    winRateByDealType: Object.entries(byType).map(([dealType, v]) => ({ dealType, ...v })),
    winRateByRegion: Object.entries(byRegion).map(([region, v]) => ({ region, ...v })),
    winRateByOwner: Object.entries(byOwner).map(([owner, v]) => ({ owner, ...v })),
  }
}
