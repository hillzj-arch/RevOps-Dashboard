import { Deal, STAGE_ORDER } from "../data/schema"

export interface StageConversionRow {
  stage: string
  count: number
  prevCount: number
  rate: number
}

export function calcStageConversions(deals: Deal[]): StageConversionRow[] {
  const counts = STAGE_ORDER.map((stage) => {
    const key = stage.toLowerCase() as keyof Deal
    return { stage, count: deals.filter((d) => Number(d[key]) > 0).length }
  })

  return counts
    .slice(1) // first stage (SAL) is the baseline — show conversions from SAL onward
    .map((curr, i) => {
      const prev = counts[i] // counts[i] is one behind because of slice(1)
      const rate = prev.count > 0 ? Math.round((curr.count / prev.count) * 100) : 0
      return { stage: curr.stage, count: curr.count, prevCount: prev.count, rate }
    })
}

export interface PipelineStage {
  stage: string
  count: number
  amount: number
  conversionRate: number | null
}

export interface PipelineResult {
  stages: PipelineStage[]
  totalPipelineValue: number
  weightedForecast: number
}

const STAGE_WEIGHTS: Record<string, number> = {
  SAL: 0.05,
  Discovery: 0.1,
  Demo: 0.2,
  Eval: 0.35,
  Proposal: 0.6,
  Procurement: 0.8,
  "Closed Won": 1.0,
}

export function calcPipeline(deals: Deal[]): PipelineResult {
  const stageMap: Record<string, { count: number; amount: number }> = {}

  for (const deal of deals) {
    const stage = deal.dealStage || "Unknown"
    if (!stageMap[stage]) stageMap[stage] = { count: 0, amount: 0 }
    stageMap[stage].count++
    stageMap[stage].amount += deal.amount
  }

  const orderedStageNames = [
    ...STAGE_ORDER,
    "Closed Won",
    "Closed Lost",
    ...Object.keys(stageMap).filter(
      (s) => !([...STAGE_ORDER, "Closed Won", "Closed Lost"] as string[]).includes(s)
    ),
  ].filter((s) => stageMap[s])

  const stages: PipelineStage[] = orderedStageNames.map((stage, i) => {
    const prev = i > 0 ? stageMap[orderedStageNames[i - 1]] : null
    return {
      stage,
      count: stageMap[stage].count,
      amount: stageMap[stage].amount,
      conversionRate:
        prev && prev.count > 0
          ? Math.round((stageMap[stage].count / prev.count) * 100)
          : null,
    }
  })

  const openDeals = deals.filter(
    (d) =>
      !d.dealStage.toLowerCase().includes("closed won") &&
      !d.dealStage.toLowerCase().includes("closed lost")
  )

  const totalPipelineValue = openDeals.reduce((sum, d) => sum + d.amount, 0)
  const weightedForecast = openDeals.reduce((sum, d) => {
    const weight = STAGE_WEIGHTS[d.dealStage] ?? 0.1
    return sum + d.amount * weight
  }, 0)

  return { stages, totalPipelineValue, weightedForecast }
}
