// src/pages/Admin/ManageUsers.jsx
import React, { useState, useMemo } from 'react'
import { 
  Search, MoreVertical, Shield, ShieldOff, Ban, 
  Mail, Eye, Edit, Trash2, UserPlus, ChevronLeft, 
  ChevronRight, CheckCircle, XCircle 
} from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { Button, Input, Badge, Avatar, Dropdown, Modal } from '../../components/common'
import { formatDate } from '../../utils/formatters'

// Mock users data
const MOCK_USERS = [
  { id: 1, name: 'John Developer', email: 'john@example.com', role: 'admin', status: 'active', apps: 5, joined: '2024-01-01', lastActive: '2024-02-22' },
  { id: 2, name: 'Sarah Engineer', email: 'sarah@example.com', role: 'developer', status: 'active', apps: 12, joined: '2023-12-15', lastActive: '2024-02-21' },
  { id: 3, name: 'Mike Designer', email: 'mike@example.com', role: 'user', status: 'active', apps: 0, joined: '2024-02-01', lastActive: '2024-02-20' },
  { id: 4, name: 'Emily Wilson', email: 'emily@example.com', role: 'developer', status: 'suspended', apps: 3, joined: '2023-11-20', lastActive: '2024-01-15' },
  { id: 5, name: 'Alex Johnson', email: 'alex@example.com', role: 'user', status: 'active', apps: 0, joined: '2024-02-10', lastActive: '2024-02-22' },
  { id: 6, name: 'Chris Brown', email: 'chris@example.com', role: 'developer', status: 'active', apps: 8, joined: '2023-10-05', lastActive: '2024-02-22' },
  { id: 7, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'banned', apps: 0, joined: '2024-01-20', lastActive: '2024-02-01' },
]

const ManageUsers = () => {
  const toast = useToast()
  const [users] = useState(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const itemsPerPage = 10

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, searchQuery, roleFilter, statusFilter])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge variant="primary" size="xs"><Shield className="w-3 h-3 mr-1" />Admin</Badge>
      case 'developer':
        return <Badge variant="info" size="xs">Developer</Badge>
      default:
        return <Badge variant="default" size="xs">User</Badge>
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="xs"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>
      case 'suspended':
        return <Badge variant="warning" size="xs">Suspended</Badge>
      case 'banned':
        return <Badge variant="danger" size="xs"><XCircle className="w-3 h-3 mr-1" />Banned</Badge>
      default:
        return null
    }
  }

  const handleAction = (action, user) => {
    switch (action) {
      case 'promote':
        toast.success(`${user.name} has been promoted to admin`)
        break
      case 'demote':
        toast.info(`${user.name} admin privileges removed`)
        break
      case 'suspend':
        toast.warning(`${user.name} has been suspended`)
        break
      case 'ban':
        toast.error(`${user.name} has been banned`)
        break
      case 'activate':
        toast.success(`${user.name} has been activated`)
        break
      default:
        break
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Users</h1>
          <p className="text-text-muted">Manage user accounts and permissions</p>
        </div>
        <Button variant="primary" icon={UserPlus}>Add User</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-main">{users.length}</p>
          <p className="text-sm text-text-muted">Total Users</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-green-400">
            {users.filter(u => u.status === 'active').length}
          </p>
          <p className="text-sm text-text-muted">Active</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-purple-400">
            {users.filter(u => u.role === 'developer').length}
          </p>
          <p className="text-sm text-text-muted">Developers</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-yellow-400">
            {users.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-sm text-text-muted">Admins</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          icon={Search}
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          containerClassName="flex-1 sm:max-w-xs"
        />
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1) }}
          className="input max-w-[150px]"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="developer">Developer</option>
          <option value="user">User</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1) }}
          className="input max-w-[150px]"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg">
                <th className="text-left py-4 px-4 font-medium text-text-muted">User</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden md:table-cell">Role</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden lg:table-cell">Apps</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden lg:table-cell">Joined</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden md:table-cell">Last Active</th>
                <th className="text-right py-4 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-bg hover:bg-bg/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-text-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    {user.apps}
                  </td>
                  <td className="py-4 px-4 text-text-muted text-sm hidden lg:table-cell">
                    {formatDate(user.joined)}
                  </td>
                  <td className="py-4 px-4 text-text-muted text-sm hidden md:table-cell">
                    {formatDate(user.lastActive)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      <Dropdown
                        align="right"
                        trigger={
                          <button className="p-2 hover:bg-bg rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <Dropdown.Item icon={Eye} onClick={() => { setSelectedUser(user); setShowUserModal(true) }}>
                          View Profile
                        </Dropdown.Item>
                        <Dropdown.Item icon={Mail}>Send Email</Dropdown.Item>
                        <Dropdown.Item icon={Edit}>Edit User</Dropdown.Item>
                        <Dropdown.Divider />
                        {user.role !== 'admin' ? (
                          <Dropdown.Item icon={Shield} onClick={() => handleAction('promote', user)}>
                            Make Admin
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item icon={ShieldOff} onClick={() => handleAction('demote', user)}>
                            Remove Admin
                          </Dropdown.Item>
                        )}
                        <Dropdown.Divider />
                        {user.status === 'active' ? (
                          <Dropdown.Item icon={Ban} danger onClick={() => handleAction('suspend', user)}>
                            Suspend User
                          </Dropdown.Item>
                        ) : (
                          <Dropdown.Item icon={CheckCircle} onClick={() => handleAction('activate', user)}>
                            Activate User
                          </Dropdown.Item>
                        )}
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-bg">
            <p className="text-sm text-text-muted">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronRight}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              />
            </div>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        title="User Details"
        size="md"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size="xl" />
              <div>
                <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                <p className="text-text-muted">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-bg rounded-xl p-4">
                <p className="text-sm text-text-muted">Apps Uploaded</p>
                <p className="text-2xl font-bold">{selectedUser.apps}</p>
              </div>
              <div className="bg-bg rounded-xl p-4">
                <p className="text-sm text-text-muted">Member Since</p>
                <p className="text-2xl font-bold">{formatDate(selectedUser.joined)}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" icon={Mail} fullWidth>Send Email</Button>
              <Button variant="primary" icon={Edit} fullWidth>Edit User</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ManageUsers