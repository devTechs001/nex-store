// src/components/apps/AppReviews.jsx
import React, { useState } from 'react'
import { Star, ThumbsUp, Flag, User } from 'lucide-react'
import { Button, Avatar, Rating, Badge } from '../common'

const AppReviews = ({ appId, reviews = [] }) => {
  const [showWriteReview, setShowWriteReview] = useState(false)

  const mockReviews = [
    {
      id: 1,
      user: { name: 'John Developer', avatar: null },
      rating: 5,
      date: '2024-02-15',
      title: 'Excellent tool for productivity',
      content: 'This app has completely transformed my workflow. The features are exactly what I needed and the performance is outstanding.',
      helpful: 24,
      verified: true,
    },
    {
      id: 2,
      user: { name: 'Sarah Engineer', avatar: null },
      rating: 4,
      date: '2024-02-10',
      title: 'Great but could use some improvements',
      content: 'Overall a solid app. The core functionality works well, but I would love to see more customization options in future updates.',
      helpful: 12,
      verified: true,
    },
    {
      id: 3,
      user: { name: 'Mike Designer', avatar: null },
      rating: 5,
      date: '2024-02-05',
      title: 'Best in class',
      content: 'Been using this for months now and it just keeps getting better. Highly recommended!',
      helpful: 8,
      verified: false,
    },
  ]

  const displayReviews = reviews.length > 0 ? reviews : mockReviews

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold mb-1">User Reviews</h3>
          <p className="text-sm text-text-muted">{displayReviews.length} reviews</p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowWriteReview(!showWriteReview)}
        >
          Write Review
        </Button>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="card space-y-4">
          <h4 className="font-semibold">Write a Review</h4>
          <div>
            <label className="block text-sm text-text-muted mb-2">Your Rating</label>
            <Rating value={0} readOnly={false} size="lg" />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Title</label>
            <input
              type="text"
              placeholder="Summarize your experience"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Review</label>
            <textarea
              placeholder="Share your experience with this app..."
              rows={4}
              className="input resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowWriteReview(false)}>
              Cancel
            </Button>
            <Button variant="primary">Submit Review</Button>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <div key={review.id} className="card">
            <div className="flex items-start gap-4">
              <Avatar src={review.user.avatar} size="lg" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{review.user.name}</span>
                  {review.verified && (
                    <Badge variant="success" size="xs">Verified</Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <Rating value={review.rating} size="sm" showValue={false} />
                  <span className="text-sm text-text-muted">{review.date}</span>
                </div>
                <h4 className="font-medium mb-2">{review.title}</h4>
                <p className="text-text-muted text-sm leading-relaxed">{review.content}</p>
                <div className="flex items-center gap-4 mt-4">
                  <button className="flex items-center gap-2 text-sm text-text-muted hover:text-main transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    Helpful ({review.helpful})
                  </button>
                  <button className="flex items-center gap-2 text-sm text-text-muted hover:text-red-400 transition-colors">
                    <Flag className="w-4 h-4" />
                    Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      {displayReviews.length > 3 && (
        <div className="text-center">
          <Button variant="ghost">Load More Reviews</Button>
        </div>
      )}
    </div>
  )
}

export default AppReviews