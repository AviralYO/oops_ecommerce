"use client"

import { Card } from "@/components/ui/card"
import { formatCurrency, convertUSDtoINR } from "@/lib/currency"

interface StockItem {
  id: string
  productName: string
  sku: string
  quantity: number
  minStock: number
  unitPrice: number
  totalValue: number
}

interface StockManagementProps {
  items?: StockItem[]
  searchTerm?: string
}

export default function StockManagement({ items, searchTerm = "" }: StockManagementProps) {
  const displayItems = items || []
  
  const filteredItems = displayItems.filter((item) => {
    const matchesSearch = searchTerm === "" || 
                         item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity < minStock) return "low"
    if (quantity < minStock * 2) return "medium"
    return "good"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "low":
        return "bg-red-500/10 text-red-700"
      case "medium":
        return "bg-yellow-500/10 text-yellow-700"
      case "good":
        return "bg-green-500/10 text-green-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-xl font-bold">Stock Management</h3>
        <p className="text-sm text-muted-foreground">Monitor and manage wholesale inventory</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Product</th>
              <th className="text-left px-6 py-3 font-semibold">SKU</th>
              <th className="text-left px-6 py-3 font-semibold">Quantity</th>
              <th className="text-left px-6 py-3 font-semibold">Min Stock</th>
              <th className="text-left px-6 py-3 font-semibold">Unit Price</th>
              <th className="text-left px-6 py-3 font-semibold">Total Value</th>
              <th className="text-left px-6 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                  {searchTerm ? "No stock items match your search." : "No stock items yet."}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => {
                const status = getStockStatus(item.quantity, item.minStock)
                return (
                <tr key={item.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                  <td className="px-6 py-4 font-semibold">{item.productName}</td>
                  <td className="px-6 py-4 text-muted-foreground">{item.sku}</td>
                  <td className="px-6 py-4">{item.quantity}</td>
                  <td className="px-6 py-4">{item.minStock}</td>
                  <td className="px-6 py-4">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-6 py-4 font-semibold">{formatCurrency(item.totalValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                      {status}
                    </span>
                  </td>
                </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
