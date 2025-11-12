"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface Review {
  id: string
  author: string
  rating: number
  title: string
  comment: string
  date: string
  verified: boolean
  helpful: number
}

interface ProductReviewProps {
  productId?: string
  productName?: string
  reviews?: Review[]
  onSubmitReview?: (review: Omit<Review, "id" | "date">) => void
}

export default function ProductReview({
  productId = "1",
  productName = "Wireless Headphones",
  reviews,
  onSubmitReview,
}: ProductReviewProps) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState("")
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultReviews: Review[] = [
    {
      id: "1",
      author: "Sarah Johnson",
      rating: 5,
      title: "Excellent sound quality!",
      comment:
        "The sound quality is amazing, very comfortable to wear for long periods. Battery lasts easily 10+ hours.",
      date: "2024-11-01",
      verified: true,
      helpful: 245,
    },
    {
      id: "2",
      author: "Michael Chen",
      rating: 4,
      title: "Great headphones, minor issues",
      comment: "Good build quality and sound. My only complaint is the charging port could be more durable.",
      date: "2024-10-28",
      verified: true,
      helpful: 128,
    },
    {
      id: "3",
      author: "Emily Rodriguez",
      rating: 5,
      title: "Best purchase ever!",
      comment: "I use these daily for work and exercise. They never disappoint. Highly recommended!",
      date: "2024-10-25",
      verified: true,
      helpful: 89,
    },
  ]

  const displayReviews = reviews || defaultReviews
  const averageRating = (displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length).toFixed(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !comment || rating === 0) return

    setIsSubmitting(true)
    setTimeout(() => {
      onSubmitReview?.({
        author: "You",
        rating,
        title,
        comment,
        verified: true,
        helpful: 0,
      })
      setRating(0)
      setTitle("")
      setComment("")
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-4xl font-bold mb-2">{averageRating}</p>
            <p className="text-sm text-muted-foreground">Average rating</p>
            <div className="mt-2">
              <span className="text-lg">⭐</span>
              <span className="text-sm text-muted-foreground ml-2">({displayReviews.length} reviews)</span>
            </div>
          </div>
          <div className="md:col-span-3 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = displayReviews.filter((r) => r.rating === star).length
              const percentage = (count / displayReviews.length) * 100
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-12">{star} ★</span>
                  <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Write Review */}
      <Card className="bg-card border-border p-6">
        <h4 className="text-lg font-bold mb-4">Write a Review</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-3xl cursor-pointer transition-transform hover:scale-110"
                >
                  <span className={rating >= star ? "text-orange-500" : "text-muted-foreground"}>★</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience"
              className="bg-input border-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Comment</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your detailed experience with this product..."
              className="bg-input border-border min-h-24"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !title || !comment}
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {displayReviews.map((review) => (
          <Card key={review.id} className="bg-card border-border p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{review.author}</p>
                  {review.verified && <Badge className="bg-green-500/20 text-green-700 text-xs">Verified</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{"⭐".repeat(review.rating)}</span>
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>
            </div>
            <h4 className="font-semibold mb-2">{review.title}</h4>
            <p className="text-muted-foreground mb-3 text-sm">{review.comment}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-xs">
                👍 Helpful ({review.helpful})
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                👎 Not helpful
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
