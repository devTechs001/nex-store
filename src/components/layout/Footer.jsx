// src/components/layout/Footer.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Github, Twitter, Mail, Heart, Linkedin, MessageCircle } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const links = {
    product: [
      { label: 'Home', to: '/' },
      { label: 'Explore', to: '/explore' },
      { label: 'Categories', to: '/explore' },
      { label: 'Upload App', to: '/upload' },
    ],
    company: [
      { label: 'About', to: '#' },
      { label: 'Blog', to: '#' },
      { label: 'Careers', to: '#' },
      { label: 'Contact', to: '#' },
    ],
    support: [
      { label: 'Help Center', to: '#' },
      { label: 'Documentation', to: '#' },
      { label: 'API', to: '#' },
      { label: 'Status', to: '#' },
    ],
    legal: [
      { label: 'Privacy', to: '#' },
      { label: 'Terms', to: '#' },
      { label: 'License', to: '#' },
      { label: 'DMCA', to: '#' },
    ],
  }

  const socials = [
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-white' },
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: MessageCircle, href: '#', label: 'Discord', color: 'hover:text-purple-400' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-500' },
    { icon: Mail, href: '#', label: 'Email', color: 'hover:text-main' },
  ]

  return (
    <footer className="bg-bg-secondary border-t border-bg-secondary/50 mt-auto hidden lg:block">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
              <span className="text-3xl group-hover:scale-110 transition-transform">🏪</span>
              <span className="text-xl font-bold text-main group-hover:glow-text transition-all">
                AppStore
              </span>
            </Link>
            <p className="text-sm text-text-muted mb-4 max-w-xs">
              Your universal app store for every platform and language. Discover, download, and share applications.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className={`
                    w-10 h-10 rounded-xl bg-bg flex items-center justify-center 
                    text-text-muted transition-all duration-300
                    hover:scale-110 hover:-translate-y-1 ${social.color}
                    hover:shadow-lg
                  `}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text mb-4 flex items-center gap-2">
                <span className="w-1 h-4 bg-main rounded-full" />
                {title}
              </h3>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-sm text-text-muted hover:text-main transition-colors duration-300 inline-block hover:translate-x-1 transform"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-bg-secondary/50 pt-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-bg/50 rounded-2xl p-6">
            <div>
              <h4 className="font-semibold text-text mb-1">Stay Updated</h4>
              <p className="text-sm text-text-muted">Subscribe to get the latest app updates and news</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-64 bg-bg border border-bg-secondary rounded-xl px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-main focus:outline-none transition-colors"
              />
              <button className="px-6 py-2.5 bg-main text-bg rounded-xl font-medium text-sm hover:shadow-[0_0_15px_var(--main-color)] transition-all whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-bg-secondary/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            © {currentYear} AppStore. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <p className="text-sm text-text-muted flex items-center gap-1.5">
              Made with <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> by Developers
            </p>
            <div className="flex items-center gap-4 text-sm text-text-muted">
              <Link to="#" className="hover:text-main transition-colors">Privacy</Link>
              <span className="w-1 h-1 bg-bg-secondary rounded-full" />
              <Link to="#" className="hover:text-main transition-colors">Terms</Link>
              <span className="w-1 h-1 bg-bg-secondary rounded-full" />
              <Link to="#" className="hover:text-main transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer