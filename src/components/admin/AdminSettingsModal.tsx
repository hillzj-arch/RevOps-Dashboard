"use client"

import { useState, useEffect, useRef } from "react"
import {
  type AISettings,
  type AIProvider,
  loadAISettings,
  saveAISettings,
  clearAISettings,
  getActiveKey,
} from "@/lib/admin/settings"

interface Props {
  onSettingsChange: (settings: AISettings) => void
}

export function AdminSettingsButton({ onSettingsChange }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        title="AI settings"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
      {open && <AdminSettingsModal onClose={() => setOpen(false)} onSettingsChange={onSettingsChange} />}
    </>
  )
}

function AdminSettingsModal({
  onClose,
  onSettingsChange,
}: {
  onClose: () => void
  onSettingsChange: (settings: AISettings) => void
}) {
  const [settings, setSettings] = useState<AISettings>(loadAISettings)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const activeKey = getActiveKey(settings)
  const keyLabel = settings.provider === "openai" ? "OpenAI API Key" : "Anthropic API Key"
  const keyPlaceholder = settings.provider === "openai" ? "sk-..." : "sk-ant-..."

  function setProvider(provider: AIProvider) {
    setSettings((s) => ({ ...s, provider }))
    setSaved(false)
  }

  function setKey(value: string) {
    setSaved(false)
    if (settings.provider === "openai") {
      setSettings((s) => ({ ...s, openaiKey: value }))
    } else {
      setSettings((s) => ({ ...s, anthropicKey: value }))
    }
  }

  function handleSave() {
    saveAISettings(settings)
    onSettingsChange(settings)
    setSaved(true)
  }

  function handleClear() {
    const cleared = { ...settings, anthropicKey: "", openaiKey: "" }
    clearAISettings()
    setSettings(cleared)
    onSettingsChange(cleared)
    setSaved(false)
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">AI Assistant Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Provider selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Provider</label>
          <div className="grid grid-cols-2 gap-2">
            {([
              { id: "anthropic" as AIProvider, label: "Anthropic", sub: "Claude" },
              { id: "openai" as AIProvider, label: "OpenAI", sub: "GPT-4o" },
            ] as const).map(({ id, label, sub }) => (
              <button
                key={id}
                onClick={() => setProvider(id)}
                className={`flex flex-col items-start px-4 py-3 rounded-xl border-2 text-left transition-colors ${
                  settings.provider === id
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span className={`text-sm font-medium ${settings.provider === id ? "text-indigo-700" : "text-gray-800"}`}>
                  {label}
                </span>
                <span className={`text-xs mt-0.5 ${settings.provider === id ? "text-indigo-500" : "text-gray-400"}`}>
                  {sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Key input */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-700">{keyLabel}</label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={activeKey}
              onChange={(e) => setKey(e.target.value)}
              placeholder={keyPlaceholder}
              className="w-full px-3.5 py-2.5 pr-20 rounded-lg border border-gray-300 text-sm text-gray-900 font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              autoComplete="off"
              spellCheck={false}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {activeKey && (
                <button
                  type="button"
                  onClick={() => setKey("")}
                  className="text-gray-300 hover:text-gray-500 px-1"
                  title="Clear key"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="text-gray-400 hover:text-gray-600 px-1"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 4.411m0 0L21 21" /></svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                )}
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Stored in your browser only — never sent to our servers, transmitted over HTTPS only.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={handleClear}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Clear all keys
          </button>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Save settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
