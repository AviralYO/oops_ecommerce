import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/currency"

interface SalesMetricsProps {
  products: Array<{ quantity: number; price: number; status: string }>
}

export default function SalesMetrics({ products }: SalesMetricsProps) {
  const totalValue = products.reduce((sum, p) => sum + p.quantity * p.price, 0)
  const inStock = products.filter((p) => p.status === "in-stock").length
  const lowStock = products.filter((p) => p.status === "low-stock").length
  const outOfStock = products.filter((p) => p.status === "out-of-stock").length

  const metrics = [
    { label: "Total Inventory Value", value: formatCurrency(totalValue), color: "from-orange-500 to-amber-500" },
    { label: "In Stock", value: inStock.toString(), color: "from-green-500 to-emerald-500" },
    { label: "Low Stock", value: lowStock.toString(), color: "from-yellow-500 to-amber-500" },
    { label: "Out of Stock", value: outOfStock.toString(), color: "from-red-500 to-rose-500" },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
              <p className="text-2xl font-bold">{metric.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} opacity-20`}></div>
          </div>
        </Card>
      ))}
    </div>
  )
}
