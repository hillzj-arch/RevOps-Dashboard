"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { DEFAULT_COLOR, loadColor, saveColor, applyColor } from "@/lib/theme"

interface ThemeContextValue {
  primaryColor: string
  setPrimaryColor: (hex: string) => void
}

const ThemeContext = createContext<ThemeContextValue>({
  primaryColor: DEFAULT_COLOR,
  setPrimaryColor: () => {},
})

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [primaryColor, setPrimaryColorState] = useState(() => loadColor())

  useEffect(() => {
    applyColor(primaryColor)
  }, [primaryColor])

  function setPrimaryColor(hex: string) {
    setPrimaryColorState(hex)
    applyColor(hex)
    saveColor(hex)
  }

  return (
    <ThemeContext.Provider value={{ primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
