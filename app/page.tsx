"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import LandingHero from "@/components/landing-hero"
import LoginModal from "@/components/login-modal"

export default function Home() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-orange-500 to-amber-500"></div>
            <span className="text-xl font-bold">LiveMART</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setShowLogin(true)}>
              Login
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <LandingHero onLoginClick={() => setShowLogin(true)} />

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">How LiveMART Works</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg">
            Connecting customers, retailers, and wholesalers seamlessly
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Customer Card */}
            <Card className="bg-card/50 border-border p-8 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 mb-4 flex items-center justify-center text-white font-bold">
                👥
              </div>
              <h3 className="text-xl font-bold mb-3">For Customers</h3>
              <p className="text-muted-foreground">
                Browse, search, and purchase from local retailers. Get real-time tracking and exclusive local products.
              </p>
            </Card>

            {/* Retailer Card */}
            <Card className="bg-card/50 border-border p-8 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-500 mb-4 flex items-center justify-center text-white font-bold">
                🏪
              </div>
              <h3 className="text-xl font-bold mb-3">For Retailers</h3>
              <p className="text-muted-foreground">
                Manage inventory, track sales, connect with wholesalers, and grow your business.
              </p>
            </Card>

            {/* Wholesaler Card */}
            <Card className="bg-card/50 border-border p-8 hover:bg-card/80 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 mb-4 flex items-center justify-center text-white font-bold">
                📦
              </div>
              <h3 className="text-xl font-bold mb-3">For Wholesalers</h3>
              <p className="text-muted-foreground">
                Manage stock, set pricing, track retailer orders, and streamline operations.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Transform Your Delivery Experience?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of customers, retailers, and wholesalers already using LiveMART.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-lg px-8"
            onClick={() => setShowLogin(true)}
          >
            Start Now
          </Button>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  )
}
