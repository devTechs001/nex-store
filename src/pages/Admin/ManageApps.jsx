// src/pages/Admin/ManageApps.jsx
import React, { useState, useMemo } from 'react'
import { 
  Search, Filter, MoreVertical, Eye, Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle, Download, Star,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useAppStore } from '../../store'
import { useToast } from '../../context/ToastContext'
import { Button, Input, Badge, Dropdown, Modal } from '../../components/common'
import { getCategoryById } from '../../data/categories'
import { formatNumber, formatDate } from '../../utils/formatters'

const ManageApps = () => {
  const toast = useToast()
  const { apps } = useAppStore()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const itemsPerPage = 10

  // Add mock status to apps
  const appsWithStatus = useMemo(() => {
    return apps.map(app => ({
      ...app,
      status: app.isVerified ? 'approved' : 
              app.isNew ? 'pending' : 
              Math.random() > 0.9 ? 'rejected' : 'approved'
    }))
  }, [apps])

  const filteredApps = useMemo(() => {
    return appsWithStatus.filter(app => {
      const matchesSearch = 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [appsWithStatus, searchQuery, statusFilter, categoryFilter])

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage)
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const statusCounts = {
    all: appsWithStatus.length,
    approved: appsWithStatus.filter(a => a.status === 'approved').length,
    pending: appsWithStatus.filter(a => a.status === 'pending').length,
    rejected: appsWithStatus.filter(a => a.status === 'rejected').length,
  }

  const handleApprove = (app) => {
    toast.success(`${app.name} has been approved`)
  }

  const handleReject = (app) => {
    toast.warning(`${app.name} has been rejected`)
  }

  const handleDelete = () => {
    if (selectedApp) {
      toast.success(`${selectedApp.name} has been deleted`)
      setShowDeleteModal(false)
      setSelectedApp(null)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" size="xs"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'pending':
        return <Badge variant="warning" size="xs"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>
      case 'rejected':
        return <Badge variant="danger" size="xs"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Manage Apps</h1>
          <p className="text-text-muted">Review and manage all applications</p>
        </div>
        <Button variant="primary">Add New App</Button>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'approved', 'pending', 'rejected'].map((status) => (
          <button
            key={status}
            onClick={() => { setStatusFilter(status); setCurrentPage(1) }}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors whitespace-nowrap ${
              statusFilter === status
                ? 'bg-main text-bg'
                : 'bg-bg-secondary hover:bg-main/20'
            }`}
          >
            {status} ({statusCounts[status]})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          icon={Search}
          placeholder="Search apps..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
          containerClassName="flex-1 sm:max-w-xs"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
          className="input max-w-[200px]"
        >
          <option value="all">All Categories</option>
          <option value="web">Web Apps</option>
          <option value="desktop">Desktop</option>
          <option value="mobile">Mobile</option>
          <option value="cli">CLI Tools</option>
          <option value="api">APIs</option>
          <option value="library">Libraries</option>
          <option value="utility">Utilities</option>
        </select>
      </div>

      {/* Apps Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg">
                <th className="text-left py-4 px-4 font-medium text-text-muted">App</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden md:table-cell">Category</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden lg:table-cell">Downloads</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden lg:table-cell">Rating</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted">Status</th>
                <th className="text-left py-4 px-4 font-medium text-text-muted hidden md:table-cell">Updated</th>
                <th className="text-right py-4 px-4 font-medium text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedApps.map((app) => (
                <tr key={app.id} className="border-b border-bg hover:bg-bg/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-bg rounded-lg flex items-center justify-center text-xl">
                        {app.icon}
                      </div>
                      <div>
                        <p className="font-medium">{app.name}</p>
                        <p className="text-sm text-text-muted">{app.developer}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <Badge size="xs">{getCategoryById(app.category)?.name}</Badge>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-text-muted">
                      <Download className="w-4 h-4" />
                      {formatNumber(app.downloads)}
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      {app.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="py-4 px-4 text-text-muted text-sm hidden md:table-cell">
                    {formatDate(app.lastUpdate)}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-2">
                      {app.status === 'pending' && (
                        <>
                          <Button 
                            variant="success" 
                            size="xs"
                            icon={CheckCircle}
                            onClick={() => handleApprove(app)}
                          />
                          <Button 
                            variant="danger" 
                            size="xs"
                            icon={XCircle}
                            onClick={() => handleReject(app)}
                          />
                        </>
                      )}
                      <Dropdown
                        align="right"
                        trigger={
                          <button className="p-2 hover:bg-bg rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        }
                      >
                        <Dropdown.Item icon={Eye}>View Details</Dropdown.Item>
                        <Dropdown.Item icon={Edit}>Edit</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item 
                          icon={Trash2} 
                          danger
                          onClick={() => { setSelectedApp(app); setShowDeleteModal(true) }}
                        >
                          Delete
                        </Dropdown.Item>
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredApps.length)} of {filteredApps.length} apps
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                icon={ChevronLeft}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              />
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'bg-main text-bg'
                        : 'hover:bg-bg-secondary'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
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

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete App"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Delete {selectedApp?.name}?</h3>
          <p className="text-text-muted mb-6">
            This action cannot be undone. This will permanently delete the app and all associated data.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} fullWidth>
              Delete App
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ManageApps