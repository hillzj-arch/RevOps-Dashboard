"use client"

import { useTheme } from "@/lib/theme-context"

interface FunnelChartProps {
  data: { name: string; value: number; sublabel?: string; fill?: string }[]
  title?: string
  formatValue?: (v: number) => string
  height?: number
}

export function FunnelChart({ data, title, formatValue, height = 320 }: FunnelChartProps) {
  const { primaryColor } = useTheme()
  const colored = data.map((d) => ({ ...d, fill: d.fill ?? primaryColor }))
  const maxValue = Math.max(...colored.map((d) => d.value), 1)
  const n = colored.length
  const barH = n > 0 ? Math.max(Math.floor((height - 4 * (n - 1)) / n), 8) : 8

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="flex flex-col" style={{ gap: 4 }}>
        {colored.map((d) => {
          const pct = d.value / maxValue
          return (
            <div key={d.name} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 text-right shrink-0" style={{ width: 88 }}>
                {d.name}
              </span>
              <div className="flex-1 flex justify-center">
                <div
                  style={{ width: `${pct * 100}%`, height: barH, backgroundColor: d.fill }}
                  className="rounded-sm"
                />
              </div>
              <div className="shrink-0 text-right" style={{ width: 56 }}>
                <div className="text-xs text-gray-700 font-medium leading-tight">
                  {formatValue ? formatValue(d.value) : d.value}
                </div>
                {d.sublabel && (
                  <div className="text-xs text-gray-400 leading-tight">{d.sublabel}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
