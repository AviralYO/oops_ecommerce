"use client"

import ProductReview from "@/components/feedback/product-review"

export default function ProductReviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
            <span className="text-xl font-bold">LiveMART</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Product Reviews</h1>
          <p className="text-muted-foreground">Share your experience and help other customers</p>
        </div>
        <ProductReview productId={params.id} />
      </main>
    </div>
  )
}
