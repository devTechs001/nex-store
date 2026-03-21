// src/pages/NotFound.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Search, ArrowLeft } from 'lucide-react'
import { Button } from '../components/common'

const NotFound = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-9xl font-bold text-main mb-4 glow-text">404</div>
        <h1 className="text-3xl font-bold mb-4">Page Not Found</h1>
        <p className="text-text-muted mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="primary" icon={Home} onClick={() => navigate('/')}>
            Go Home
          </Button>
          <Button variant="outline" icon={Search} onClick={() => navigate('/explore')}>
            Explore Apps
          </Button>
          <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFound