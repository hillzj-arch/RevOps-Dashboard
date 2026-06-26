"use client"

interface Column<T> {
  key: keyof T
  label: string
  format?: (value: T[keyof T]) => string
  align?: "left" | "right" | "center"
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: Column<T>[]
  title?: string
  maxRows?: number
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, title, maxRows }: DataTableProps<T>) {
  const rows = maxRows ? data.slice(0, maxRows) : data

  return (
    <div className="w-full">
      {title && <h3 className="text-sm font-semibold text-gray-700 mb-3">{title}</h3>}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {columns.map((col) => (
                <th key={String(col.key)} className={`px-4 py-3 font-semibold text-gray-600 ${col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left"}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`px-4 py-3 text-gray-800 ${col.align === "right" ? "text-right font-mono" : col.align === "center" ? "text-center" : "text-left"}`}>
                    {col.format ? col.format(row[col.key]) : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {maxRows && data.length > maxRows && (
        <p className="text-xs text-gray-400 mt-2">Showing {maxRows} of {data.length} rows</p>
      )}
    </div>
  )
}
