"use client"

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface LineChartProps {
  data: Record<string, string | number>[]
  xKey: string
  lines: { key: string; label?: string; color?: string }[]
  title?: string
  formatValue?: (v: number) => string
  height?: number
}

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"]

export function LineChart({ data, xKey, lines, title, formatValue, height = 320 }: LineChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey={xKey} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={formatValue} />
          <Tooltip formatter={(value, name) => [formatValue ? formatValue(Number(value)) : value, name]} />
          {lines.length > 1 && <Legend />}
          {lines.map((line, i) => (
            <Line key={line.key} type="monotone" dataKey={line.key} name={line.label ?? line.key} stroke={line.color ?? COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
