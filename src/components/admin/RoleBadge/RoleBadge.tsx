import { Badge } from '@components/shared'
import { UserRole } from '@/types/profile.types'
import './RoleBadge.css'

interface RoleBadgeProps {
  role: UserRole
}

const RoleBadge = ({ role }: RoleBadgeProps) => (
  <Badge variant={role === 'admin' ? 'accent' : 'neutral'}>{role === 'admin' ? 'Admin' : 'User'}</Badge>
)

export default RoleBadge
