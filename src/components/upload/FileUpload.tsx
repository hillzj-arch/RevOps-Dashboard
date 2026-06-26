"use client"

import { useRef, useState } from "react"
import { parseFile } from "@/lib/data/parser"
import { useDeals } from "@/lib/data/deals-context"

export function FileUpload() {
  const { setDeals, isDemo, resetToDemo } = useDeals()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  async function handleFile(file: File) {
    setStatus("loading")
    setErrorMsg("")
    try {
      const deals = await parseFile(file)
      if (deals.length === 0) throw new Error("No rows found in file")
      setDeals(deals)
      setStatus("idle")
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse file")
      setStatus("error")
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="flex items-center gap-3">
      {!isDemo && (
        <button onClick={resetToDemo} className="text-xs text-slate-500 hover:text-slate-700 underline">
          Reset to demo data
        </button>
      )}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
      >
        {status === "loading" ? (
          <span>Importing…</span>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload spreadsheet</span>
          </>
        )}
      </div>
      <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
      {status === "error" && <span className="text-xs text-red-600">{errorMsg}</span>}
    </div>
  )
}
