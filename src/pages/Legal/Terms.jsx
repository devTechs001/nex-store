// src/pages/Legal/Terms.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, FileText } from 'lucide-react'
import { SEOHead } from '../../components/common'

const Terms = () => {
  const navigate = useNavigate()

  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing or using the AppStore platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.',
    },
    {
      title: '2. Use License',
      content: 'Permission is granted to temporarily download and use the applications available on AppStore for personal, non-commercial transitory use only. This license shall automatically terminate if you violate any of these restrictions.',
    },
    {
      title: '3. User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.',
    },
    {
      title: '4. App Submissions',
      content: 'By uploading an application to AppStore, you represent that you have the right to distribute the application and that it does not infringe upon any third-party rights. We reserve the right to remove any application at our discretion.',
    },
    {
      title: '5. Reviews and Content',
      content: 'Users may post reviews and other content. You grant AppStore a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute such content. You agree not to post content that is unlawful, harmful, or offensive.',
    },
    {
      title: '6. Intellectual Property',
      content: 'The AppStore platform and its original content, features, and functionality are owned by AppStore and are protected by international copyright, trademark, and other intellectual property laws.',
    },
    {
      title: '7. Disclaimer',
      content: 'The applications on AppStore are provided "as is." AppStore makes no warranties, expressed or implied, and hereby disclaims all warranties including, without limitation, implied warranties of merchantability and fitness for a particular purpose.',
    },
    {
      title: '8. Limitation of Liability',
      content: 'In no event shall AppStore be liable for any damages arising out of the use or inability to use the applications or platform, even if AppStore has been notified of the possibility of such damages.',
    },
    {
      title: '9. Changes to Terms',
      content: 'AppStore reserves the right to modify these terms at any time. We will notify users of significant changes via email or through the platform. Continued use after changes constitutes acceptance.',
    },
    {
      title: '10. Contact',
      content: 'If you have questions about these Terms of Service, please contact us at legal@appstore.com.',
    },
  ]

  return (
    <div className="page-container max-w-3xl mx-auto">
      <SEOHead title="Terms of Service" description="AppStore Terms of Service" />
      
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-main transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-main/20 flex items-center justify-center">
          <FileText className="w-7 h-7 text-main" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-text-muted">Last updated: February 22, 2024</p>
        </div>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title} className="card">
            <h2 className="text-lg font-semibold mb-3 text-main">{section.title}</h2>
            <p className="text-text-muted leading-relaxed">{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Terms