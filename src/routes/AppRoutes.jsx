// src/routes/AppRoutes.jsx (COMPLETE FINAL)
import React, { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { Loader } from '../components/common'
import ErrorBoundary from '../components/common/ErrorBoundary'
import ScrollToTop from '../components/common/ScrollToTop'
import KeyboardShortcuts from '../components/common/KeyboardShortcuts'

// Lazy load all pages
const Home = lazy(() => import('../pages/Home'))
const Explore = lazy(() => import('../pages/Explore'))
const AppDetail = lazy(() => import('../pages/AppDetail'))
const Downloads = lazy(() => import('../pages/Downloads'))
const Favorites = lazy(() => import('../pages/Favorites'))
const Profile = lazy(() => import('../pages/Profile'))
const Settings = lazy(() => import('../pages/Settings'))
const Upload = lazy(() => import('../pages/Upload'))
const Collections = lazy(() => import('../pages/Collections'))
const CollectionDetail = lazy(() => import('../pages/CollectionDetail'))
const Category = lazy(() => import('../pages/Category'))
const Search = lazy(() => import('../pages/Search'))
const DeveloperProfile = lazy(() => import('../pages/DeveloperProfile'))
const Help = lazy(() => import('../pages/Help'))
const WhatsNew = lazy(() => import('../pages/WhatsNew'))
const NotFound = lazy(() => import('../pages/NotFound'))
const Maintenance = lazy(() => import('../pages/Maintenance'))

// Admin
const AdminDashboard = lazy(() => import('../pages/Admin/Dashboard'))
const ManageApps = lazy(() => import('../pages/Admin/ManageApps'))
const ManageUsers = lazy(() => import('../pages/Admin/ManageUsers'))
const Analytics = lazy(() => import('../pages/Admin/Analytics'))

// Auth
const Login = lazy(() => import('../pages/Auth/Login'))
const Register = lazy(() => import('../pages/Auth/Register'))

const IS_MAINTENANCE = false // Toggle this for maintenance mode

const AppRoutes = () => {
  if (IS_MAINTENANCE) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Maintenance />
      </Suspense>
    )
  }

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <KeyboardShortcuts />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="app/:id" element={<AppDetail />} />
            <Route path="downloads" element={<Downloads />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="upload" element={<Upload />} />
            <Route path="collections" element={<Collections />} />
            <Route path="collections/:id" element={<CollectionDetail />} />
            <Route path="category/:slug" element={<Category />} />
            <Route path="search" element={<Search />} />
            <Route path="developer/:name" element={<DeveloperProfile />} />
            <Route path="help" element={<Help />} />
            <Route path="whats-new" element={<WhatsNew />} />

            <Route path="admin">
              <Route index element={<AdminDashboard />} />
              <Route path="apps" element={<ManageApps />} />
              <Route path="users" element={<ManageUsers />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>
          </Route>

          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}

const PageLoader = () => (
  <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-bg-secondary rounded-full" />
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-main border-t-transparent rounded-full animate-spin" />
    </div>
    <p className="text-text-muted animate-pulse">Loading...</p>
  </div>
)

export default AppRoutes