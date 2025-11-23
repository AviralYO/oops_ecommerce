"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface ProductFormProps {
  onSubmit: (product: any) => Promise<void>
}

export default function WholesalerProductForm({ onSubmit }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: "",
    wholesaler_price: "",
    retail_price: "",
    category: "",
    image: null as File | null,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        wholesaler_price: parseFloat(formData.wholesaler_price),
        retail_price: parseFloat(formData.retail_price),
        category: formData.category,
      }

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      })

      if (response.ok) {
        await onSubmit(formData)
        setFormData({
          name: "",
          description: "",
          quantity: "",
          wholesaler_price: "",
          retail_price: "",
          category: "",
          image: null,
        })
        setImagePreview(null)
        alert("Product added successfully!")
      } else {
        const { error } = await response.json()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error("Error adding product:", error)
      alert("Failed to add product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border p-6 max-w-2xl">
      <h3 className="text-xl font-bold mb-6">Add New Product</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Premium Wireless Headphones"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            placeholder="Describe your product..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="quantity">Stock Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
            min="0"
            placeholder="100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="wholesaler_price">Wholesale Price (₹)</Label>
            <Input
              id="wholesaler_price"
              type="number"
              value={formData.wholesaler_price}
              onChange={(e) => setFormData({ ...formData, wholesaler_price: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="800.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Price you sell to retailers</p>
          </div>

          <div>
            <Label htmlFor="retail_price">Suggested Retail Price (₹)</Label>
            <Input
              id="retail_price"
              type="number"
              value={formData.retail_price}
              onChange={(e) => setFormData({ ...formData, retail_price: e.target.value })}
              required
              min="0"
              step="0.01"
              placeholder="999.00"
            />
            <p className="text-xs text-muted-foreground mt-1">Suggested price for customers</p>
          </div>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            placeholder="e.g., Electronics, Clothing, Food"
          />
        </div>



        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
        >
          {loading ? "Adding Product..." : "Add Product"}
        </Button>
      </form>
    </Card>
  )
}
