// src/pages/Legal/Privacy.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shield, Eye, Database, Lock, Globe, Mail } from 'lucide-react'

const Privacy = () => {
  const navigate = useNavigate()

  const sections = [
    {
      icon: Eye,
      title: 'Information We Collect',
      items: [
        'Account information (name, email, password)',
        'Usage data (apps viewed, downloaded, searched)',
        'Device information (browser, OS, screen size)',
        'Cookies and similar tracking technologies',
      ],
    },
    {
      icon: Database,
      title: 'How We Use Your Information',
      items: [
        'Provide and maintain the platform',
        'Personalize your experience',
        'Send notifications about updates',
        'Analyze usage to improve our services',
        'Prevent fraud and ensure security',
      ],
    },
    {
      icon: Globe,
      title: 'Information Sharing',
      items: [
        'We do not sell your personal information',
        'We may share data with service providers who assist us',
        'We may disclose information when required by law',
        'Aggregated, anonymized data may be shared publicly',
      ],
    },
    {
      icon: Lock,
      title: 'Data Security',
      items: [
        'End-to-end encryption for sensitive data',
        'Regular security audits and penetration testing',
        'SOC 2 Type II compliance',
        'Data stored in secure, encrypted databases',
      ],
    },
    {
      icon: Shield,
      title: 'Your Rights',
      items: [
        'Access your personal data at any time',
        'Request correction of inaccurate data',
        'Request deletion of your account and data',
        'Opt out of marketing communications',
        'Export your data in a portable format',
      ],
    },
  ]

  return (
    <div className="page-container max-w-3xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-text-muted hover:text-main transition-colors mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-xl bg-main/20 flex items-center justify-center">
          <Shield className="w-7 h-7 text-main" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-text-muted">Last updated: February 22, 2024</p>
        </div>
      </div>

      <div className="card mb-8">
        <p className="text-text-muted leading-relaxed">
          At AppStore, we take your privacy seriously. This Privacy Policy explains how we collect, 
          use, disclose, and safeguard your information when you use our platform. Please read this 
          policy carefully.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title} className="card">
            <div className="flex items-center gap-3 mb-4">
              <section.icon className="w-6 h-6 text-main" />
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            <ul className="space-y-3">
              {section.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-main mt-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card mt-8 text-center">
        <Mail className="w-8 h-8 mx-auto text-main mb-3" />
        <h3 className="font-semibold mb-1">Questions about privacy?</h3>
        <p className="text-text-muted text-sm mb-3">Contact our Data Protection Officer</p>
        <a href="mailto:privacy@appstore.com" className="text-main hover:underline">
          privacy@appstore.com
        </a>
      </div>
    </div>
  )
}

export default Privacy