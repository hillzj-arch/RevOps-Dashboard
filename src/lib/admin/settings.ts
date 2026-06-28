export type AIProvider = "anthropic" | "openai"

export interface AISettings {
  provider: AIProvider
  anthropicKey: string
  openaiKey: string
}

const STORAGE_KEY = "revops_ai_settings"

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "anthropic",
  anthropicKey: "",
  openaiKey: "",
}

export function loadAISettings(): AISettings {
  if (typeof window === "undefined") return DEFAULT_AI_SETTINGS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...DEFAULT_AI_SETTINGS, ...JSON.parse(raw) } : DEFAULT_AI_SETTINGS
  } catch {
    return DEFAULT_AI_SETTINGS
  }
}

export function saveAISettings(settings: AISettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

export function clearAISettings(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getActiveKey(settings: AISettings): string {
  return settings.provider === "openai" ? settings.openaiKey : settings.anthropicKey
}
