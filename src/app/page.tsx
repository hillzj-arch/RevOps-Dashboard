"use client"

import { CopilotKit } from "@copilotkit/react-core"
import { DealsProvider, useDeals } from "@/lib/data/deals-context"
import { FileUpload } from "@/components/upload/FileUpload"
import { WinRateCard } from "@/components/dashboard/WinRateCard"
import { GeographicCard } from "@/components/dashboard/GeographicCard"
import { PipelineCard } from "@/components/dashboard/PipelineCard"
import { SalesCycleCard } from "@/components/dashboard/SalesCycleCard"
import { StageWinRateCard } from "@/components/dashboard/StageWinRateCard"
import { StageConversionCard } from "@/components/dashboard/StageConversionCard"
import { CopilotPanel } from "@/components/copilot/CopilotPanel"

function DemoBanner() {
  const { isDemo } = useDeals()
  if (!isDemo) return null
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2.5 text-sm text-indigo-700">
      Viewing <strong>demo data</strong> — upload your own spreadsheet to analyze your pipeline.
    </div>
  )
}

async function handleLogout() {
  await fetch("/api/auth/logout", { method: "POST" })
  window.location.href = "/login"
}

function Dashboard() {
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
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-700">
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-4">
        <DemoBanner />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WinRateCard />
          <PipelineCard />
          <GeographicCard />
          <SalesCycleCard />
          <StageWinRateCard />
          <StageConversionCard />
        </div>
        <CopilotPanel />
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <DealsProvider>
        <Dashboard />
      </DealsProvider>
    </CopilotKit>
  )
}
