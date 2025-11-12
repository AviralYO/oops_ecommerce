"use client"

export default function LandingHero({ onLoginClick }: { onLoginClick: () => void }) {
  return (
    <div className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/10 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-500/20 to-transparent rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-full filter blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Your Delivery Platform
              <span className="block bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Connect directly with local retailers and wholesalers. Shop smarter, manage better, deliver faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onLoginClick}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold transition-all hover:shadow-lg hover:shadow-orange-500/20"
              >
                Get Started
              </button>
              <button className="px-8 py-3 rounded-lg border border-primary text-primary hover:bg-primary/10 font-semibold transition-colors">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border">
              <div>
                <div className="text-2xl font-bold text-primary">10K+</div>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">500+</div>
                <p className="text-sm text-muted-foreground">Retailers</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-primary">24/7</div>
                <p className="text-sm text-muted-foreground">Support</p>
              </div>
            </div>
          </div>

          {/* Right side graphic */}
          <div className="relative h-96 rounded-2xl overflow-hidden border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-500/20 border border-primary/50 mb-4">
                  <div className="text-4xl">📱</div>
                </div>
                <p className="text-muted-foreground">Digital Commerce Simplified</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
