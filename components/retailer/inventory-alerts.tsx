"use client"

import { Card } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"

interface Alert {
  id: string
  type: "critical" | "warning" | "info"
  title: string
  message: string
  product?: string
}

interface InventoryAlertsProps {
  alerts?: Alert[]
}

export default function InventoryAlerts({ alerts }: InventoryAlertsProps) {
  const defaultAlerts: Alert[] = [
    {
      id: "1",
      type: "critical",
      title: "Out of Stock",
      message: "Smart Speaker is out of stock",
      product: "Smart Speaker",
    },
    {
      id: "2",
      type: "warning",
      title: "Low Stock Alert",
      message: "Cotton T-Shirt has only 8 units remaining",
      product: "Cotton T-Shirt",
    },
    {
      id: "3",
      type: "info",
      title: "Reorder Suggestion",
      message: "Organic Coffee Beans selling well, consider reordering",
      product: "Organic Coffee Beans",
    },
  ]

  const displayAlerts = alerts || defaultAlerts

  const getAlertStyles = (type: string) => {
    switch (type) {
      case "critical":
        return { bg: "bg-red-50", border: "border-red-200", icon: AlertCircle, color: "text-red-700" }
      case "warning":
        return { bg: "bg-yellow-50", border: "border-yellow-200", icon: AlertTriangle, color: "text-yellow-700" }
      case "info":
        return { bg: "bg-blue-50", border: "border-blue-200", icon: Info, color: "text-blue-700" }
      default:
        return { bg: "bg-gray-50", border: "border-gray-200", icon: Info, color: "text-gray-700" }
    }
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Inventory Alerts</h3>
      <div className="space-y-3">
        {displayAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No alerts at this time</p>
        ) : (
          displayAlerts.map((alert) => {
            const styles = getAlertStyles(alert.type)
            const Icon = styles.icon
            return (
              <div key={alert.id} className={`p-4 rounded-lg ${styles.bg} border ${styles.border}`}>
                <div className="flex gap-3">
                  <Icon className={`w-5 h-5 ${styles.color} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1">
                    <p className={`font-semibold ${styles.color}`}>{alert.title}</p>
                    <p className={`text-sm ${styles.color}/80`}>{alert.message}</p>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
