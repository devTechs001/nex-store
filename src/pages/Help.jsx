// src/pages/Help.jsx
import React, { useState } from 'react'
import { 
  Search, ChevronDown, ChevronUp, Book, MessageCircle, 
  Mail, Phone, ExternalLink, HelpCircle, Shield, 
  Download, Upload, Star, CreditCard
} from 'lucide-react'
import { Input, Button, Badge } from '../components/common'

const CATEGORIES = [
  { id: 'getting-started', label: 'Getting Started', icon: Book, color: '#0ef' },
  { id: 'downloads', label: 'Downloads', icon: Download, color: '#10b981' },
  { id: 'uploads', label: 'Uploading', icon: Upload, color: '#8b5cf6' },
  { id: 'account', label: 'Account', icon: Shield, color: '#f59e0b' },
  { id: 'reviews', label: 'Reviews', icon: Star, color: '#ef4444' },
  { id: 'billing', label: 'Billing', icon: CreditCard, color: '#ec4899' },
]

const FAQ_DATA = [
  {
    category: 'getting-started',
    questions: [
      {
        q: 'What is AppStore?',
        a: 'AppStore is a universal application marketplace where you can discover, download, and share applications for any platform and programming language. From web apps to desktop software, mobile apps to CLI tools.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click the "Sign Up" button in the top right corner. You can register with your email or use Google/GitHub authentication for quick setup.',
      },
      {
        q: 'Is AppStore free to use?',
        a: 'Yes! AppStore is free to browse and download free apps. Some apps may have premium pricing set by their developers. We also offer a Pro plan for advanced features.',
      },
      {
        q: 'What platforms are supported?',
        a: 'We support Windows, macOS, Linux, iOS, Android, Web, and cross-platform applications. You can filter by platform when browsing.',
      },
    ],
  },
  {
    category: 'downloads',
    questions: [
      {
        q: 'How do I download an app?',
        a: 'Navigate to the app page and click the "Download" or "Get App" button. The app will be added to your downloads section where you can track installation progress.',
      },
      {
        q: 'Can I download apps for offline use?',
        a: 'Yes, once downloaded, apps are available offline. However, some web-based apps may require an internet connection for full functionality.',
      },
      {
        q: 'How do I update my downloaded apps?',
        a: 'Go to your Downloads page. Apps with available updates will show an "Update" button. You can also enable auto-updates in Settings.',
      },
    ],
  },
  {
    category: 'uploads',
    questions: [
      {
        q: 'How do I upload my app?',
        a: 'Click "Upload" in the navigation bar. Fill in the app details, upload your files, and submit for review. Our team typically reviews submissions within 24-48 hours.',
      },
      {
        q: 'What file formats are accepted?',
        a: 'We accept ZIP, TAR, and individual executable files up to 500MB. For larger apps, please contact support.',
      },
      {
        q: 'How long does review take?',
        a: 'Most apps are reviewed within 24-48 hours. Complex applications may take longer. You will receive an email notification when your app is approved.',
      },
    ],
  },
  {
    category: 'account',
    questions: [
      {
        q: 'How do I change my password?',
        a: 'Go to Settings > Account > Change Password. Enter your current password and your new password to update.',
      },
      {
        q: 'Can I delete my account?',
        a: 'Yes, go to Settings > Danger Zone > Delete Account. Please note this action is permanent and cannot be undone.',
      },
    ],
  },
  {
    category: 'reviews',
    questions: [
      {
        q: 'How do I leave a review?',
        a: 'Navigate to any app page and scroll to the Reviews section. Click "Write Review" to share your experience.',
      },
      {
        q: 'Can I edit my review?',
        a: 'Yes, you can edit or delete your reviews at any time from the app page or your profile.',
      },
    ],
  },
  {
    category: 'billing',
    questions: [
      {
        q: 'How do payments work?',
        a: 'We support credit cards, debit cards, and PayPal. All transactions are secured with industry-standard encryption.',
      },
      {
        q: 'Can I get a refund?',
        a: 'We offer a 30-day refund policy for paid apps. Contact support with your order details to request a refund.',
      },
    ],
  },
]

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [expandedQuestions, setExpandedQuestions] = useState(new Set())

  const toggleQuestion = (key) => {
    setExpandedQuestions(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const filteredFAQs = FAQ_DATA
    .filter(section => selectedCategory === 'all' || section.category === selectedCategory)
    .map(section => ({
      ...section,
      questions: section.questions.filter(q =>
        !searchQuery ||
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(section => section.questions.length > 0)

  const totalResults = filteredFAQs.reduce((sum, s) => sum + s.questions.length, 0)

  return (
    <div className="page-container max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-main/20 flex items-center justify-center mx-auto mb-6">
          <HelpCircle className="w-10 h-10 text-main" />
        </div>
        <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
        <p className="text-xl text-text-muted mb-8">
          Search our knowledge base or browse by category
        </p>

        <div className="max-w-xl mx-auto">
          <Input
            icon={Search}
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`p-4 rounded-xl text-center transition-all ${
            selectedCategory === 'all'
              ? 'bg-main text-bg shadow-[0_0_15px_var(--main-color)]'
              : 'bg-bg-secondary hover:bg-main/20'
          }`}
        >
          <HelpCircle className="w-6 h-6 mx-auto mb-2" />
          <span className="text-sm font-medium">All</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`p-4 rounded-xl text-center transition-all ${
              selectedCategory === cat.id
                ? 'bg-main text-bg shadow-[0_0_15px_var(--main-color)]'
                : 'bg-bg-secondary hover:bg-main/20'
            }`}
          >
            <cat.icon 
              className="w-6 h-6 mx-auto mb-2" 
              style={{ color: selectedCategory === cat.id ? 'inherit' : cat.color }}
            />
            <span className="text-sm font-medium">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-text-muted mb-4">
          {totalResults} result{totalResults !== 1 ? 's' : ''} found
        </p>
      )}

      {/* FAQ Sections */}
      <div className="space-y-6">
        {filteredFAQs.map((section) => {
          const category = CATEGORIES.find(c => c.id === section.category)
          return (
            <div key={section.category}>
              {selectedCategory === 'all' && (
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  {category && <category.icon className="w-5 h-5" style={{ color: category.color }} />}
                  {category?.label || section.category}
                </h2>
              )}
              <div className="space-y-2">
                {section.questions.map((item, i) => {
                  const key = `${section.category}-${i}`
                  const isExpanded = expandedQuestions.has(key)
                  return (
                    <div key={key} className="card">
                      <button
                        onClick={() => toggleQuestion(key)}
                        className="w-full flex items-center justify-between text-left"
                      >
                        <span className="font-medium pr-4">{item.q}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-main flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted flex-shrink-0" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-bg">
                          <p className="text-text-muted leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {totalResults === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-16 h-16 mx-auto text-text-muted mb-4" />
          <h3 className="text-xl font-semibold mb-2">No results found</h3>
          <p className="text-text-muted mb-6">
            Try different keywords or contact our support team
          </p>
        </div>
      )}

      {/* Contact Support */}
      <div className="mt-12 card bg-gradient-to-r from-main/20 to-purple-500/10">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
          <p className="text-text-muted mb-6">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" icon={MessageCircle}>Live Chat</Button>
            <Button variant="outline" icon={Mail}>Email Support</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Help