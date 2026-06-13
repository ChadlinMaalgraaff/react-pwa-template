import { ReactNode } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { EmptyState, Spinner } from '@components/shared'
import './DataTable.css'

export interface DataTableColumn<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  getRowId: (row: T) => string
  onEdit?: (row: T) => void
  onDelete?: (row: T) => void
  emptyMessage?: string
  isLoading?: boolean
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
}

const DataTable = <T,>({
  columns,
  rows,
  getRowId,
  onEdit,
  onDelete,
  emptyMessage = 'No data found.',
  isLoading = false,
  page,
  pageSize,
  total,
  onPageChange,
}: DataTableProps<T>) => {
  const hasActions = Boolean(onEdit || onDelete)
  const showPagination =
    page !== undefined && pageSize !== undefined && total !== undefined && total > pageSize
  const totalPages = showPagination ? Math.max(1, Math.ceil(total / pageSize)) : 1

  if (isLoading) {
    return <Spinner />
  }

  if (rows.length === 0) {
    return <EmptyState title={emptyMessage} />
  }

  return (
    <div className="data-table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="data-table-header">
                {column.header}
              </th>
            ))}
            {hasActions && <th className="data-table-header">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)}>
              {columns.map((column) => (
                <td key={column.key} className="data-table-cell">
                  {column.render
                    ? column.render(row)
                    : String((row as Record<string, unknown>)[column.key] ?? '')}
                </td>
              ))}
              {hasActions && (
                <td className="data-table-cell data-table-actions">
                  {onEdit && (
                    <button type="button" aria-label="Edit row" onClick={() => onEdit(row)}>
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button type="button" aria-label="Delete row" onClick={() => onDelete(row)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {showPagination && (
        <div className="data-table-pagination">
          <button
            type="button"
            onClick={() => onPageChange?.((page as number) - 1)}
            disabled={(page as number) <= 1}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange?.((page as number) + 1)}
            disabled={(page as number) >= totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default DataTable
