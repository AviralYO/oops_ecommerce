"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface Review {
  id: string
  customer_id?: string
  rating: number
  review_text: string
  created_at: string
  profiles?: {
    name: string
    email: string
  }
}

interface ProductReviewProps {
  productId: string
  productName?: string
  orderId?: string
}

export default function ProductReview({
  productId,
  productName = "Product",
  orderId,
}: ProductReviewProps) {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchReviews()
  }, [productId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/reviews?product_id=${productId}`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("Error fetching reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewText || rating === 0) {
      toast({
        title: "Error",
        description: "Please provide a rating and review text",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          order_id: orderId,
          rating,
          review_text: reviewText,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Your review has been submitted",
        })
        setRating(0)
        setReviewText("")
        fetchReviews()
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit review",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <Card className="bg-card border-border p-6">
        <h3 className="text-xl font-bold mb-6">Customer Reviews</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading reviews...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-bold mb-2">{averageRating}</p>
              <p className="text-sm text-muted-foreground">Average rating</p>
              <div className="mt-2">
                <span className="text-lg">⭐</span>
                <span className="text-sm text-muted-foreground ml-2">({reviews.length} reviews)</span>
              </div>
            </div>
            <div className="md:col-span-3 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter((r) => r.rating === star).length
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-sm w-12">{star} ★</span>
                  <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-orange-500 to-amber-500"
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
            <label className="block text-sm font-medium mb-2">Your Review</label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your detailed experience with this product..."
              className="bg-input border-border min-h-24"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !reviewText}
            className="bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="bg-card border-border p-6 text-center">
            <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="bg-card border-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{review.profiles?.name || "Anonymous"}</p>
                    <Badge className="bg-green-500/20 text-green-700 text-xs">Verified Purchase</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{"⭐".repeat(review.rating)}</span>
                    <span className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground mb-3 text-sm">{review.review_text}</p>
          </Card>
          ))
        )}
      </div>
    </div>
  )
}
