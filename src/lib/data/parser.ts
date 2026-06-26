import Papa from "papaparse"
import * as XLSX from "xlsx"
import { Deal } from "./schema"

const COLUMN_MAP: Record<string, keyof Deal> = {
  "deal name": "dealName",
  country: "country",
  region: "region",
  "deal stage": "dealStage",
  "close date": "closeDate",
  "lead source": "leadSource",
  "lead source detail": "leadSourceDetail",
  "latest traffic source": "latestTrafficSource",
  "deal owner": "dealOwner",
  amount: "amount",
  "create quarter": "createQuarter",
  "sales cycle in days": "salesCycleDays",
  sal: "sal",
  discovery: "discovery",
  demo: "demo",
  eval: "eval",
  proposal: "proposal",
  procurement: "procurement",
  "deal type": "dealType",
  "# of employees": "numberOfEmployees",
  "open source?": "openSource",
}

function parseDate(value: string): Date | null {
  if (!value) return null
  const d = new Date(value)
  return isNaN(d.getTime()) ? null : d
}

function parseNumber(value: string | number): number {
  if (typeof value === "number") return value
  const cleaned = String(value).replace(/[$,\s]/g, "")
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : n
}

function parseBoolean(value: string): boolean {
  if (!value) return false
  return ["yes", "true", "1", "y"].includes(String(value).toLowerCase().trim())
}

function normalizeRow(raw: Record<string, string>): Deal {
  const normalized: Partial<Deal> = {}
  for (const [rawKey, rawValue] of Object.entries(raw)) {
    const mappedKey = COLUMN_MAP[rawKey.toLowerCase().trim()]
    if (!mappedKey) continue
    switch (mappedKey) {
      case "closeDate":
        normalized[mappedKey] = parseDate(rawValue)
        break
      case "amount":
      case "salesCycleDays":
      case "sal":
      case "discovery":
      case "demo":
      case "eval":
      case "proposal":
      case "procurement":
      case "numberOfEmployees":
        normalized[mappedKey] = parseNumber(rawValue)
        break
      case "openSource":
        normalized[mappedKey] = parseBoolean(rawValue)
        break
      default:
        ;(normalized as Record<string, string>)[mappedKey] = rawValue?.trim() ?? ""
    }
  }
  return {
    dealName: "",
    country: "",
    region: "",
    dealStage: "",
    closeDate: null,
    leadSource: "",
    leadSourceDetail: "",
    latestTrafficSource: "",
    dealOwner: "",
    amount: 0,
    createQuarter: "",
    salesCycleDays: 0,
    sal: 0,
    discovery: 0,
    demo: 0,
    eval: 0,
    proposal: 0,
    procurement: 0,
    dealType: "",
    numberOfEmployees: 0,
    openSource: false,
    ...normalized,
  }
}

export async function parseFile(file: File): Promise<Deal[]> {
  const ext = file.name.split(".").pop()?.toLowerCase()

  if (ext === "csv") {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve((results.data as Record<string, string>[]).map(normalizeRow))
        },
        error: reject,
      })
    })
  }

  if (ext === "xlsx" || ext === "xls") {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: "array", cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
      raw: false,
      dateNF: "yyyy-mm-dd",
    })
    return rows.map(normalizeRow)
  }

  throw new Error("Unsupported file type. Please upload a CSV or Excel file.")
}
