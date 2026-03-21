// src/components/layout/Layout.jsx (UPDATED)
import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Footer from './Footer'
import ErrorBoundary from '../common/ErrorBoundary'

const Layout = () => {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>

        {/* Footer */}
        <Footer />

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  )
}

export default Layout