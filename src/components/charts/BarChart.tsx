"use client"

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from "recharts"

interface BarChartProps {
  data: Record<string, string | number>[]
  xKey: string
  bars: { key: string; label?: string; color?: string }[]
  title?: string
  formatValue?: (v: number) => string
  showLabels?: boolean
  height?: number
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"]

export function BarChart({ data, xKey, bars, title, formatValue, showLabels, height = 320 }: BarChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatValue} />
          <Tooltip formatter={(value, name) => [formatValue ? formatValue(Number(value)) : value, name]} />
          {bars.length > 1 && <Legend />}
          {bars.map((bar, i) => (
            <Bar key={bar.key} dataKey={bar.key} name={bar.label ?? bar.key} fill={bar.color ?? COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]}>
              {showLabels && (
                <LabelList
                  dataKey={bar.key}
                  position="top"
                  style={{ fontSize: 11, fill: "#6b7280" }}
                  formatter={(v: number) => formatValue ? formatValue(v) : v}
                />
              )}
            </Bar>
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
