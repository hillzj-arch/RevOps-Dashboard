export interface Deal {
  dealName: string
  country: string
  region: string
  dealStage: string
  closeDate: Date | null
  leadSource: string
  leadSourceDetail: string
  latestTrafficSource: string
  dealOwner: string
  amount: number
  createQuarter: string
  salesCycleDays: number
  sal: number
  discovery: number
  demo: number
  eval: number
  proposal: number
  procurement: number
  dealType: string
  numberOfEmployees: number
  openSource: boolean
}

export type DealStage =
  | "SAL"
  | "Discovery"
  | "Demo"
  | "Eval"
  | "Proposal"
  | "Procurement"
  | "Closed Won"
  | "Closed Lost"

export const STAGE_ORDER: DealStage[] = [
  "SAL",
  "Discovery",
  "Demo",
  "Eval",
  "Proposal",
  "Procurement",
]

export const STAGE_TIME_FIELDS: (keyof Deal)[] = [
  "sal",
  "discovery",
  "demo",
  "eval",
  "proposal",
  "procurement",
]
