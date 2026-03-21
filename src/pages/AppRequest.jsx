// src/pages/AppRequest.jsx
import React, { useState } from 'react'
import { 
  Lightbulb, Send, ThumbsUp, MessageCircle, Clock, 
  ChevronUp, ChevronDown, Filter, TrendingUp, Plus,
  CheckCircle, Tag, ArrowLeft
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../context/ToastContext'
import { useLocalStorage } from '../hooks'
import { Button, Input, Badge, Modal, EmptyState, Avatar } from '../components/common'

const REQUEST_CATEGORIES = [
  { id: 'web', label: 'Web App', icon: '🌐' },
  { id: 'desktop', label: 'Desktop App', icon: '🖥️' },
  { id: 'mobile', label: 'Mobile App', icon: '📱' },
  { id: 'cli', label: 'CLI Tool', icon: '⌨️' },
  { id: 'library', label: 'Library', icon: '📚' },
  { id: 'api', label: 'API / Service', icon: '🔗' },
  { id: 'plugin', label: 'Plugin / Extension', icon: '🔌' },
  { id: 'other', label: 'Other', icon: '💡' },
]

const MOCK_REQUESTS = [
  {
    id: 1,
    title: 'Markdown editor with live preview',
    description: 'Looking for a lightweight markdown editor with syntax highlighting and live preview. Bonus if it supports Mermaid diagrams.',
    category: 'web',
    author: 'John Developer',
    createdAt: '2024-02-20',
    upvotes: 47,
    comments: 12,
    status: 'open',
    tags: ['markdown', 'editor', 'web'],
  },
  {
    id: 2,
    title: 'Cross-platform password manager CLI',
    description: 'A terminal-based password manager that works on all platforms with GPG encryption support.',
    category: 'cli',
    author: 'Sarah Engineer',
    createdAt: '2024-02-18',
    upvotes: 35,
    comments: 8,
    status: 'in-progress',
    tags: ['password', 'security', 'cli'],
  },
  {
    id: 3,
    title: 'React Native component library',
    description: 'A comprehensive UI component library for React Native with dark mode support and accessibility built-in.',
    category: 'library',
    author: 'Mike Designer',
    createdAt: '2024-02-15',
    upvotes: 89,
    comments: 23,
    status: 'open',
    tags: ['react-native', 'ui', 'components'],
  },
  {
    id: 4,
    title: 'API testing GUI tool',
    description: 'Like Postman but lighter and open source. Support for GraphQL, REST, and WebSocket testing.',
    category: 'desktop',
    author: 'Alex Wilson',
    createdAt: '2024-02-10',
    upvotes: 124,
    comments: 31,
    status: 'fulfilled',
    tags: ['api', 'testing', 'graphql'],
  },
  {
    id: 5,
    title: 'Database migration tool',
    description: 'Universal database migration tool supporting PostgreSQL, MySQL, SQLite with rollback capabilities.',
    category: 'cli',
    author: 'Emily Chen',
    createdAt: '2024-02-08',
    upvotes: 56,
    comments: 15,
    status: 'open',
    tags: ['database', 'migration', 'sql'],
  },
]

const AppRequest = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [requests, setRequests] = useLocalStorage('appRequests', MOCK_REQUESTS)
  const [votedIds, setVotedIds] = useLocalStorage('votedRequestIds', [])
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('votes')
  const [searchQuery, setSearchQuery] = useState('')

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
  })

  const handleVote = (requestId) => {
    if (votedIds.includes(requestId)) {
      setVotedIds(votedIds.filter(id => id !== requestId))
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, upvotes: r.upvotes - 1 } : r
      ))
    } else {
      setVotedIds([...votedIds, requestId])
      setRequests(requests.map(r =>
        r.id === requestId ? { ...r, upvotes: r.upvotes + 1 } : r
      ))
    }
  }

  const handleCreate = () => {
    if (!newRequest.title.trim() || !newRequest.description.trim() || !newRequest.category) {
      toast.error('Please fill in all required fields')
      return
    }

    const request = {
      id: Date.now(),
      title: newRequest.title.trim(),
      description: newRequest.description.trim(),
      category: newRequest.category,
      author: 'You',
      createdAt: new Date().toISOString().split('T')[0],
      upvotes: 1,
      comments: 0,
      status: 'open',
      tags: newRequest.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    setRequests([request, ...requests])
    setVotedIds([...votedIds, request.id])
    setNewRequest({ title: '', description: '', category: '', tags: '' })
    setShowCreate(false)
    toast.success('Request submitted!')
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <Badge variant="info" size="xs">Open</Badge>
      case 'in-progress':
        return <Badge variant="warning" size="xs">In Progress</Badge>
      case 'fulfilled':
        return <Badge variant="success" size="xs"><CheckCircle className="w-3 h-3 mr-1" />Fulfilled</Badge>
      case 'closed':
        return <Badge variant="default" size="xs">Closed</Badge>
      default:
        return null
    }
  }

  const filteredRequests = requests
    .filter(r => {
      const matchesFilter = filter === 'all' || r.status === filter
      const matchesSearch = !searchQuery ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'votes') return b.upvotes - a.upvotes
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt)
      if (sortBy === 'comments') return b.comments - a.comments
      return 0
    })

  const statusCounts = {
    all: requests.length,
    open: requests.filter(r => r.status === 'open').length,
    'in-progress': requests.filter(r => r.status === 'in-progress').length,
    fulfilled: requests.filter(r => r.status === 'fulfilled').length,
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Lightbulb className="w-8 h-8 text-main" />
            App Requests
          </h1>
          <p className="text-text-muted mt-1">
            Can't find what you need? Request it and the community will vote!
          </p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>
          New Request
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <Lightbulb className="w-6 h-6 mx-auto text-main mb-2" />
          <p className="text-xl font-bold">{statusCounts.all}</p>
          <p className="text-xs text-text-muted">Total Requests</p>
        </div>
        <div className="card text-center">
          <Clock className="w-6 h-6 mx-auto text-blue-400 mb-2" />
          <p className="text-xl font-bold">{statusCounts.open}</p>
          <p className="text-xs text-text-muted">Open</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-6 h-6 mx-auto text-yellow-400 mb-2" />
          <p className="text-xl font-bold">{statusCounts['in-progress']}</p>
          <p className="text-xs text-text-muted">In Progress</p>
        </div>
        <div className="card text-center">
          <CheckCircle className="w-6 h-6 mx-auto text-green-400 mb-2" />
          <p className="text-xl font-bold">{statusCounts.fulfilled}</p>
          <p className="text-xs text-text-muted">Fulfilled</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <Input
          icon={Filter}
          placeholder="Search requests..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          containerClassName="flex-1 sm:max-w-sm"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'open', 'in-progress', 'fulfilled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-main text-bg'
                  : 'bg-bg-secondary hover:bg-main/20'
              }`}
            >
              {status.replace('-', ' ')} ({statusCounts[status] || 0})
            </button>
          ))}
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input max-w-[160px]"
        >
          <option value="votes">Most Voted</option>
          <option value="newest">Newest</option>
          <option value="comments">Most Discussed</option>
        </select>
      </div>

      {/* Requests List */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-4">
          {filteredRequests.map((request) => {
            const hasVoted = votedIds.includes(request.id)
            const category = REQUEST_CATEGORIES.find(c => c.id === request.category)

            return (
              <div key={request.id} className="card card-hover flex gap-4">
                {/* Vote */}
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleVote(request.id)}
                    className={`p-2 rounded-xl transition-all ${
                      hasVoted
                        ? 'bg-main text-bg'
                        : 'bg-bg hover:bg-main/20 text-text-muted'
                    }`}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <span className={`text-lg font-bold ${hasVoted ? 'text-main' : ''}`}>
                    {request.upvotes}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold">{request.title}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <p className="text-text-muted text-sm mb-3 line-clamp-2">{request.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Badge size="xs">
                      {category?.icon} {category?.label}
                    </Badge>
                    {request.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" size="xs">#{tag}</Badge>
                    ))}
                    <span className="text-text-muted flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {request.comments}
                    </span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{request.author}</span>
                    <span className="text-text-muted">•</span>
                    <span className="text-text-muted">{request.createdAt}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <EmptyState
          icon={Lightbulb}
          title="No requests found"
          description="Be the first to request an app!"
          action={() => setShowCreate(true)}
          actionLabel="Create Request"
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Request an App"
        size="md"
      >
        <div className="space-y-5">
          <Input
            label="Title *"
            placeholder="What app do you need?"
            value={newRequest.title}
            onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-text mb-2">Description *</label>
            <textarea
              placeholder="Describe what the app should do, key features, platform requirements..."
              value={newRequest.description}
              onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
              className="input resize-none h-28"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {REQUEST_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setNewRequest({ ...newRequest, category: cat.id })}
                  className={`p-3 rounded-xl text-sm font-medium transition-all text-center ${
                    newRequest.category === cat.id
                      ? 'bg-main text-bg'
                      : 'bg-bg hover:bg-main/20'
                  }`}
                >
                  <span className="text-lg block mb-1">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Tags"
            placeholder="react, cli, api (comma separated)"
            value={newRequest.tags}
            onChange={(e) => setNewRequest({ ...newRequest, tags: e.target.value })}
            helper="Comma-separated tags to help categorize your request"
          />

          <div className="flex gap-3 pt-4 border-t border-bg">
            <Button variant="ghost" onClick={() => setShowCreate(false)} fullWidth>Cancel</Button>
            <Button variant="primary" icon={Send} onClick={handleCreate} fullWidth>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AppRequest