"use client"

import { useState } from "react"
import { CopilotKit } from "@copilotkit/react-core"
import { DealsProvider, useDeals } from "@/lib/data/deals-context"
import { FileUpload } from "@/components/upload/FileUpload"
import { WinRateCard } from "@/components/dashboard/WinRateCard"
import { GeographicCard } from "@/components/dashboard/GeographicCard"
import { PipelineCard } from "@/components/dashboard/PipelineCard"
import { SalesCycleCard } from "@/components/dashboard/SalesCycleCard"
import { StageWinRateCard } from "@/components/dashboard/StageWinRateCard"
import { StageConversionCard } from "@/components/dashboard/StageConversionCard"
import { RepRevenueCard } from "@/components/dashboard/RepRevenueCard"
import { CopilotPanel } from "@/components/copilot/CopilotPanel"
import { AdminSettingsButton } from "@/components/admin/AdminSettingsModal"
import { TimeFilterBar } from "@/components/dashboard/TimeFilterBar"
import { type AISettings, loadAISettings, getActiveKey } from "@/lib/admin/settings"

function DemoBanner() {
  const { isDemo } = useDeals()
  if (!isDemo) return null
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-indigo-700">
      Viewing <strong>demo data</strong> — upload your own spreadsheet to analyze your pipeline.
    </div>
  )
}

function CopilotErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3 text-sm text-red-800">
      <svg className="h-4 w-4 mt-0.5 shrink-0 text-red-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
      </svg>
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 leading-none text-lg">&times;</button>
    </div>
  )
}

function Dashboard({
  copilotError,
  onDismissCopilotError,
  onSettingsChange,
  hasKey,
}: {
  copilotError: string | null
  onDismissCopilotError: () => void
  onSettingsChange: (s: AISettings) => void
  hasKey: boolean
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">RevOps Intelligence</h1>
            <p className="text-xs text-gray-500 mt-0.5">12-month pipeline analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <FileUpload />
            <AdminSettingsButton onSettingsChange={onSettingsChange} />
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <DemoBanner />
        {copilotError && <CopilotErrorBanner message={copilotError} onDismiss={onDismissCopilotError} />}
        <TimeFilterBar />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WinRateCard />
          <PipelineCard />
          <GeographicCard />
          <SalesCycleCard />
          <StageWinRateCard />
          <StageConversionCard />
          <RepRevenueCard />
        </div>
        <CopilotPanel hasKey={hasKey} onSettingsChange={onSettingsChange} />
      </main>
    </div>
  )
}

export default function Home() {
  const [copilotError, setCopilotError] = useState<string | null>(null)
  const [aiSettings, setAISettings] = useState<AISettings>(loadAISettings)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleCopilotError(errorEvent: any) {
    const status = errorEvent.context?.response?.status
    const msg: string = errorEvent.error?.message ?? ""

    if (status === 402 || /credit|balance|quota/i.test(msg)) {
      setCopilotError("Insufficient credits. Top up your API account or enter a different key in AI settings (⚙).")
    } else if (status === 401 || status === 403) {
      setCopilotError("API key is invalid or missing. Check your key in AI settings (⚙).")
    } else if (msg) {
      setCopilotError(`AI assistant error: ${msg}`)
    } else {
      setCopilotError("The AI assistant encountered an error. Please try again.")
    }
  }

  const activeKey = getActiveKey(aiSettings)
  const copilotHeaders = activeKey
    ? { "x-user-api-key": activeKey, "x-user-provider": aiSettings.provider }
    : undefined

  return (
    <CopilotKit runtimeUrl="/api/copilotkit" headers={copilotHeaders} onError={handleCopilotError}>
      <DealsProvider>
        <Dashboard
          copilotError={copilotError}
          onDismissCopilotError={() => setCopilotError(null)}
          onSettingsChange={(s) => { setAISettings(s); setCopilotError(null) }}
          hasKey={!!activeKey}
        />
      </DealsProvider>
    </CopilotKit>
  )
}
