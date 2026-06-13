import { useEffect, useState } from 'react'
import { Button, SearchBar, ConfirmDialog } from '@components/shared'
import { DataTable, DataTableColumn, RoleBadge } from '@components/admin'
import { useAdminUsers } from '@hooks/useAdminUsers'
import { useAppSelector } from '@hooks/redux.hooks'
import { AdminUserSummary } from '@/types/admin-users.types'
import { formatDate } from '@utils/helpers'
import './UserManagement.css'

const PAGE_SIZE = 10

const UserManagement = () => {
  const currentUserId = useAppSelector((state) => state.auth.user?.id)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { users, total, isLoading, setParams, updateUserRole } = useAdminUsers({ page: 1, pageSize: PAGE_SIZE })
  const [togglingUser, setTogglingUser] = useState<AdminUserSummary | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setParams({ page, pageSize: PAGE_SIZE, search: search || undefined })
  }, [search, page, setParams])

  const handleSearch = (value: string) => {
    setSearch(value)
    setPage(1)
  }

  const handleToggleRole = async () => {
    if (!togglingUser) return
    try {
      setIsSaving(true)
      await updateUserRole(togglingUser.id, togglingUser.role === 'admin' ? 'user' : 'admin')
      setTogglingUser(null)
    } catch {
      // error notification already dispatched by useAdminUsers
    } finally {
      setIsSaving(false)
    }
  }

  const columns: DataTableColumn<AdminUserSummary>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => <RoleBadge role={row.role} /> },
    { key: 'createdAt', header: 'Joined', render: (row) => formatDate(row.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={row.id === currentUserId}
          onClick={() => setTogglingUser(row)}
        >
          {row.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
        </Button>
      ),
    },
  ]

  return (
    <div className="user-management-page">
      <h1 className="user-management-title">Users</h1>

      <SearchBar
        placeholder="Search by name or email..."
        onSearch={handleSearch}
        className="user-management-search"
      />

      <DataTable
        columns={columns}
        rows={users}
        getRowId={(row) => row.id}
        emptyMessage="No users found."
        isLoading={isLoading}
        page={page}
        pageSize={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <ConfirmDialog
        isOpen={!!togglingUser}
        title={togglingUser?.role === 'admin' ? 'Remove Admin Access' : 'Grant Admin Access'}
        message={
          togglingUser?.role === 'admin'
            ? `Are you sure you want to remove admin access from "${togglingUser?.name}"?`
            : `Are you sure you want to make "${togglingUser?.name}" an admin?`
        }
        confirmText={togglingUser?.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
        isDangerous={togglingUser?.role === 'admin'}
        isLoading={isSaving}
        onConfirm={handleToggleRole}
        onCancel={() => setTogglingUser(null)}
      />
    </div>
  )
}

export default UserManagement
