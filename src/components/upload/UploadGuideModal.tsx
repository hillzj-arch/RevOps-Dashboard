"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import ExcelJS from "exceljs"

const REQUIRED_COLUMNS = [
  { header: "Deal Name", example: "Acme Corp - New Deal", note: "Unique deal identifier" },
  { header: "Deal Stage", example: "Closed Won", note: "SAL / Discovery / Demo / Eval / Proposal / Procurement / Closed Won / Closed Lost" },
  { header: "Close Date", example: "2025-03-15", note: "YYYY-MM-DD or MM/DD/YYYY" },
  { header: "Amount", example: "50000", note: "Deal value in USD, no currency symbol needed" },
  { header: "Deal Owner", example: "Jane Smith", note: "Rep's full name" },
  { header: "Region", example: "US/CAN", note: "US/CAN / EMEA / APAC / LATAM" },
]

const OPTIONAL_COLUMNS = [
  { header: "Country", example: "United States" },
  { header: "Deal Type", example: "New Business" },
  { header: "Lead Source", example: "Website" },
  { header: "Lead Source Detail", example: "Google Ads" },
  { header: "Latest Traffic Source", example: "Organic Search" },
  { header: "Create Quarter", example: "Q1" },
  { header: "Sales Cycle in Days", example: "45" },
  { header: "SAL", example: "5" },
  { header: "Discovery", example: "10" },
  { header: "Demo", example: "15" },
  { header: "Eval", example: "20" },
  { header: "Proposal", example: "5" },
  { header: "Procurement", example: "3" },
  { header: "# of Employees", example: "500" },
  { header: "Close Lost Reason", example: "Budget" },
]

const ALL_HEADERS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].map((c) => c.header)

const SAMPLE_ROWS = [
  ["Acme Corp - New Deal", "Closed Won", "2025-03-15", 50000, "Jane Smith", "US/CAN", "United States", "New Business", "Website", "", "Organic Search", "Q1", 45, 5, 10, 15, 20, 5, 3, 500, ""],
  ["Beta Inc - Expansion", "Closed Lost", "2025-04-02", 25000, "John Doe", "EMEA", "Germany", "Expansion", "Event", "", "Direct Traffic", "Q2", 30, 3, 8, 10, 9, 0, 0, 1200, "Budget"],
  ["Gamma LLC - New Deal", "Demo", "2025-06-30", 75000, "Jane Smith", "APAC", "Japan", "New Business", "Website", "", "Paid Search", "Q2", 0, 7, 12, 0, 0, 0, 0, 3000, ""],
]

async function downloadTemplate() {
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Deals")

  const headerRow = sheet.addRow(ALL_HEADERS)
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } }
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF6366F1" } }
    cell.alignment = { vertical: "middle", horizontal: "center" }
  })

  // Mark required columns with a light yellow background
  const requiredCount = REQUIRED_COLUMNS.length
  for (let i = 1; i <= requiredCount; i++) {
    const cell = headerRow.getCell(i)
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4F46E5" } }
  }

  SAMPLE_ROWS.forEach((row) => sheet.addRow(row))

  sheet.columns.forEach((col) => { col.width = 20 })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "revops-template.xlsx"
  a.click()
  URL.revokeObjectURL(url)
}

export function UploadGuideModal({ onClose }: { onClose: () => void }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  async function handleDownload() {
    setDownloading(true)
    try { await downloadTemplate() } finally { setDownloading(false) }
  }

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Spreadsheet Format</h2>
            <p className="text-xs text-gray-500 mt-0.5">Accepted formats: .xlsx, .xls, .csv</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 space-y-5">
          {/* Required */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Required columns</span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-[var(--p-100)] text-[var(--p-700)] font-medium">{REQUIRED_COLUMNS.length}</span>
            </div>
            <div className="space-y-2">
              {REQUIRED_COLUMNS.map((col) => (
                <div key={col.header} className="flex items-start gap-3 text-sm">
                  <code className="shrink-0 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-800 font-mono w-44">{col.header}</code>
                  <div className="min-w-0">
                    <span className="text-gray-500 text-xs">{col.note}</span>
                    <span className="ml-2 text-gray-300 text-xs">e.g. {col.example}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Optional columns</span>
              <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">{OPTIONAL_COLUMNS.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {OPTIONAL_COLUMNS.map((col) => (
                <div key={col.header} className="flex items-center gap-2 text-sm">
                  <code className="px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700 font-mono truncate">{col.header}</code>
                  <span className="text-gray-400 text-xs truncate">{col.example}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Column names are case-insensitive. Extra columns are ignored. Rows missing required fields will import with blank values.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">Template includes 3 sample rows to illustrate the format.</p>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 bg-[var(--p-600)] hover:bg-[var(--p-700)] disabled:opacity-60 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? "Generating…" : "Download template"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
