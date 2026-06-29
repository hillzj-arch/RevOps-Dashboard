export const DEFAULT_COLOR = "#6366f1"
const STORAGE_KEY = "revops-primary-color"

export const PRESET_COLORS = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Violet", value: "#8b5cf6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Amber", value: "#f59e0b" },
  { label: "Slate", value: "#64748b" },
]

export function loadColor(): string {
  if (typeof window === "undefined") return DEFAULT_COLOR
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_COLOR
}

export function saveColor(hex: string): void {
  localStorage.setItem(STORAGE_KEY, hex)
}

export function applyColor(hex: string): void {
  document.documentElement.style.setProperty("--p", hex)
}
