"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  price: number
  category: string
  status: string
}

interface InventoryTableProps {
  products: Product[]
  onUpdate: (id: string, product: Product) => void
  onDelete: (id: string) => void
}

export default function InventoryTable({ products, onUpdate, onDelete }: InventoryTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<Product>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500/10 text-green-700"
      case "low-stock":
        return "bg-yellow-500/10 text-yellow-700"
      case "out-of-stock":
        return "bg-red-500/10 text-red-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

  const handleEdit = (product: Product) => {
    setEditingId(product.id)
    setEditValues(product)
  }

  const handleSave = () => {
    if (editingId && editValues) {
      onUpdate(editingId, { ...editValues } as Product)
      setEditingId(null)
    }
  }

  return (
    <Card className="bg-card border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-accent/50 border-b border-border">
            <tr>
              <th className="text-left px-6 py-3 font-semibold">Product Name</th>
              <th className="text-left px-6 py-3 font-semibold">SKU</th>
              <th className="text-left px-6 py-3 font-semibold">Quantity</th>
              <th className="text-left px-6 py-3 font-semibold">Price</th>
              <th className="text-left px-6 py-3 font-semibold">Status</th>
              <th className="text-left px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b border-border hover:bg-accent/30 transition-colors">
                <td className="px-6 py-4">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editValues.name || ""}
                      onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                      className="px-2 py-1 rounded border border-border bg-input text-foreground"
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td className="px-6 py-4 text-muted-foreground">{product.sku}</td>
                <td className="px-6 py-4">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={editValues.quantity || 0}
                      onChange={(e) => setEditValues({ ...editValues, quantity: Number.parseInt(e.target.value) })}
                      className="px-2 py-1 rounded border border-border bg-input text-foreground w-20"
                    />
                  ) : (
                    product.quantity
                  )}
                </td>
                <td className="px-6 py-4">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      value={editValues.price || 0}
                      onChange={(e) => setEditValues({ ...editValues, price: Number.parseFloat(e.target.value) })}
                      className="px-2 py-1 rounded border border-border bg-input text-foreground w-24"
                    />
                  ) : (
                    formatCurrency(product.price)
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status.replace("-", " ")}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    {editingId === product.id ? (
                      <>
                        <Button size="sm" onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
                          Save
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setEditingId(null)}
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleEdit(product)}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => onDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
