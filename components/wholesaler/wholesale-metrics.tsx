"use client"

import { Card } from "@/components/ui/card"
import { formatCurrencyCompact } from "@/lib/currency"

interface WholesaleMetricsProps {
  pendingOrders?: number
  totalRevenue?: number
  activeRetailers?: number
  deliveryRate?: number
}

export default function WholesaleMetrics({
  pendingOrders = 8,
  totalRevenue = 125400,
  activeRetailers = 12,
  deliveryRate = 98.5,
}: WholesaleMetricsProps) {
  const metrics = [
    {
      label: "Pending Orders",
      value: pendingOrders.toString(),
      color: "from-yellow-500 to-amber-500",
      subtext: "Awaiting confirmation",
    },
    {
      label: "Total Revenue",
      value: formatCurrencyCompact(totalRevenue),
      color: "from-green-500 to-emerald-500",
      subtext: "This month",
    },
    {
      label: "Active Retailers",
      value: activeRetailers.toString(),
      color: "from-blue-500 to-cyan-500",
      subtext: "Connected partners",
    },
    {
      label: "Delivery Rate",
      value: `${deliveryRate}%`,
      color: "from-purple-500 to-indigo-500",
      subtext: "On-time delivery",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-2">{metric.subtext}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} opacity-20`}></div>
          </div>
        </Card>
      ))}
    </div>
  )
}
