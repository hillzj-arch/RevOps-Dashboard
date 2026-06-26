#!/usr/bin/env node
// Run: node scripts/generate-demo-data.js
const XLSX = require("xlsx")
const fs = require("fs")
const path = require("path")
const os = require("os")

const VALID_REGIONS = new Set(["US/CAN", "EMEA", "LATAM", "APAC"])

const STAGE_MAP = {
  Won: "Closed Won",
  Lost: "Closed Lost",
  Demonstration: "Demo",
  "Eval/PoC": "Eval",
  "POC Validation": "Eval",
  SAL: "SAL",
  Discovery: "Discovery",
  Proposal: "Proposal",
  Procurement: "Procurement",
}

function excelDateToJS(serial) {
  if (!serial || typeof serial !== "number") return null
  return new Date((serial - 25569) * 86400 * 1000)
}

const wb = XLSX.readFile(path.join(os.homedir(), "Documents/xlsdatagenerator/Sales Data.xlsx"))
const ws = wb.Sheets["Sheet1"]
const rows = XLSX.utils.sheet_to_json(ws, { defval: null })

const deals = rows
  .filter((r) => VALID_REGIONS.has(r["Region"]))
  .map((r) => ({
    dealName: r["Deal Name"] ?? "",
    country: r["Country"] ?? "",
    region: r["Region"] ?? "",
    dealStage: STAGE_MAP[r["Deal Stage"]] ?? r["Deal Stage"] ?? "",
    closeDate: excelDateToJS(r["Close Date"]),
    leadSource: (r["Lead Source"] ?? "").trim(),
    leadSourceDetail: "",
    latestTrafficSource: r["Latest Traffic Source"] ?? "",
    dealOwner: r["Deal owner"] ?? "",
    amount: r["Amount"] ?? 0,
    createQuarter: r["Create Quarter"] ?? "",
    salesCycleDays: r["Sales Cycle in Days"] ?? 0,
    sal: r["SAL"] ?? 0,
    discovery: r["Discovery"] ?? 0,
    demo: r["Demonstration"] ?? 0,
    eval: r["Evaluation"] ?? 0,
    proposal: r["Proposal"] ?? 0,
    procurement: r["Procurement"] ?? 0,
    dealType: r["Deal Type"] ?? "",
    numberOfEmployees: r["# of Employees"] ?? 0,
    openSource: false,
  }))

function formatDate(d) {
  if (!d) return "null"
  return `new Date("${d.toISOString().slice(0, 10)}")`
}

function s(v) {
  return JSON.stringify(v)
}

const lines = deals.map(
  (d) =>
    `  { dealName: ${s(d.dealName)}, country: ${s(d.country)}, region: ${s(d.region)}, dealStage: ${s(d.dealStage)}, closeDate: ${formatDate(d.closeDate)}, leadSource: ${s(d.leadSource)}, leadSourceDetail: ${s(d.leadSourceDetail)}, latestTrafficSource: ${s(d.latestTrafficSource)}, dealOwner: ${s(d.dealOwner)}, amount: ${d.amount}, createQuarter: ${s(d.createQuarter)}, salesCycleDays: ${d.salesCycleDays}, sal: ${d.sal || 0}, discovery: ${d.discovery || 0}, demo: ${d.demo || 0}, eval: ${d.eval || 0}, proposal: ${d.proposal || 0}, procurement: ${d.procurement || 0}, dealType: ${s(d.dealType)}, numberOfEmployees: ${d.numberOfEmployees || 0}, openSource: ${d.openSource} }`
)

const output = `import { Deal } from "./schema"

// Generated from Sales Data.xlsx — ${deals.length} deals
export const DEMO_DEALS: Deal[] = [
${lines.join(",\n")}
]
`

const outPath = path.join(__dirname, "../src/lib/data/demo-data.ts")
fs.writeFileSync(outPath, output)
console.log(`Wrote ${deals.length} deals to ${outPath}`)
