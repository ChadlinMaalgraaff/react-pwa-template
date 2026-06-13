import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable, { DataTableColumn } from '@components/admin/DataTable/DataTable'

interface Row {
  id: string
  name: string
}

const columns: DataTableColumn<Row>[] = [{ key: 'name', header: 'Name' }]

const rows: Row[] = [
  { id: 'row-1', name: 'Rice' },
  { id: 'row-2', name: 'Beans' },
]

describe('DataTable Component', () => {
  it('renders column headers and row data', () => {
    render(<DataTable columns={columns} rows={rows} getRowId={(row) => row.id} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Rice')).toBeInTheDocument()
    expect(screen.getByText('Beans')).toBeInTheDocument()
  })

  it('renders an empty state when there are no rows', () => {
    render(<DataTable columns={columns} rows={[]} getRowId={(row) => row.id} emptyMessage="No ingredients" />)
    expect(screen.getByText('No ingredients')).toBeInTheDocument()
  })

  it('renders a loading spinner when isLoading is true', () => {
    render(<DataTable columns={columns} rows={[]} getRowId={(row) => row.id} isLoading />)
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument()
  })

  it('calls onEdit and onDelete with the row', async () => {
    const user = userEvent.setup()
    const handleEdit = vi.fn()
    const handleDelete = vi.fn()
    render(
      <DataTable columns={columns} rows={rows} getRowId={(row) => row.id} onEdit={handleEdit} onDelete={handleDelete} />
    )

    const editButtons = screen.getAllByRole('button', { name: 'Edit row' })
    await user.click(editButtons[0])
    expect(handleEdit).toHaveBeenCalledWith(rows[0])

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete row' })
    await user.click(deleteButtons[1])
    expect(handleDelete).toHaveBeenCalledWith(rows[1])
  })

  it('renders pagination controls and calls onPageChange', async () => {
    const user = userEvent.setup()
    const handlePageChange = vi.fn()
    render(
      <DataTable
        columns={columns}
        rows={rows}
        getRowId={(row) => row.id}
        page={1}
        pageSize={2}
        total={4}
        onPageChange={handlePageChange}
      />
    )

    expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(handlePageChange).toHaveBeenCalledWith(2)
  })
})
