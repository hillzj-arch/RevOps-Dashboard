"use client"

import { useRef, useState } from "react"
import { parseFile } from "@/lib/data/parser"
import { useDeals } from "@/lib/data/deals-context"
import { UploadGuideModal } from "./UploadGuideModal"

export function FileUpload() {
  const { setDeals, isDemo, resetToDemo } = useDeals()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [showGuide, setShowGuide] = useState(false)

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
    <>
      <div className="flex items-center gap-2">
        {!isDemo && (
          <button onClick={resetToDemo} className="text-xs text-slate-500 hover:text-slate-700 underline">
            Reset to demo data
          </button>
        )}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors"
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
        <button
          onClick={() => setShowGuide(true)}
          className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 text-xs font-semibold transition-colors"
          title="Format guide & template"
        >
          ?
        </button>
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
      </div>
      {status === "error" && <span className="text-xs text-red-600 block mt-1">{errorMsg}</span>}
      {showGuide && <UploadGuideModal onClose={() => setShowGuide(false)} />}
    </>
  )
}
