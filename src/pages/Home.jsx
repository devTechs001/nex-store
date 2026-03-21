// src/pages/Home.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Zap, TrendingUp, ChevronRight, Search, Upload } from 'lucide-react'
import { useAppStore } from '../store'
import { Button } from '../components/common'
import { AppGrid, FeaturedApps } from '../components/apps'
import { CategoryList } from '../components/categories'
import { getFeaturedApps, getNewApps, getTopRatedApps } from '../data/mockApps'

const Home = () => {
  const { apps } = useAppStore()

  const featuredApps = getFeaturedApps()
  const newApps = getNewApps()
  const topApps = getTopRatedApps(6)

  return (
    <div className="page-container">
      {/* Featured Carousel */}
      <FeaturedApps apps={featuredApps} />

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title">Categories</h2>
          <Link to="/explore">
            <Button variant="ghost" icon={ChevronRight} iconPosition="right">
              See All
            </Button>
          </Link>
        </div>
        <CategoryList />
      </section>

      {/* New Releases */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title flex items-center gap-2">
            <Zap className="w-6 h-6 text-green-400" />
            New Releases
          </h2>
          <Link to="/explore?filter=new">
            <Button variant="ghost" icon={ChevronRight} iconPosition="right">
              See All
            </Button>
          </Link>
        </div>
        <AppGrid apps={newApps} columns={4} />
      </section>

      {/* Top Rated */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-title flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            Top Rated
          </h2>
          <Link to="/explore?sort=rating">
            <Button variant="ghost" icon={ChevronRight} iconPosition="right">
              See All
            </Button>
          </Link>
        </div>
        <AppGrid apps={topApps} view="list" />
      </section>

      {/* CTA Banner */}
      <section className="card bg-gradient-to-r from-main/20 via-purple-500/10 to-pink-500/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-4">
          <div>
            <h3 className="text-2xl font-bold mb-2">Have an app to share?</h3>
            <p className="text-text-muted">
              Upload your app and reach thousands of developers worldwide
            </p>
          </div>
          <Link to="/upload">
            <Button variant="primary" size="lg" icon={Upload}>
              Upload Your App
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home