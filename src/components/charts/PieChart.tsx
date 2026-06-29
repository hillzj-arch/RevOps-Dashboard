"use client"

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface PieChartProps {
  data: { name: string; value: number }[]
  title?: string
  formatValue?: (v: number) => string
  height?: number
  colors?: string[]
}

const DEFAULT_COLORS = ["#ef4444", "#f59e0b", "#6366f1", "#10b981", "#3b82f6", "#8b5cf6"]

export function PieChart({ data, title, formatValue, height = 280, colors = DEFAULT_COLORS }: PieChartProps) {
  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name) => [formatValue ? formatValue(Number(value)) : value, name]} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}
