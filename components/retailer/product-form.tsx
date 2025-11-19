"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

interface ProductFormProps {
  onSubmit: (product: any) => void
}

export default function ProductForm({ onSubmit }: ProductFormProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 0,
    price: 0,
    category: "electronics",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
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
      let imageUrl = null

      // Upload image if provided
      if (imageFile) {
        const formData = new FormData()
        formData.append("file", imageFile)

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (uploadResponse.ok) {
          const { url } = await uploadResponse.json()
          imageUrl = url
        }
      }

      // Create product
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          quantity: Number.parseInt(formData.quantity as any),
          price: Number.parseFloat(formData.price as any),
          image_url: imageUrl,
        }),
      })

      if (response.ok) {
        const { product } = await response.json()
        onSubmit(product)
        // Reset form
        setFormData({ name: "", description: "", quantity: 0, price: 0, category: "electronics" })
        setImageFile(null)
        setImagePreview(null)
        alert("Product added successfully!")
      } else {
        const { error } = await response.json()
        alert(`Error: ${error}`)
      }
    } catch (error) {
      console.error("Error creating product:", error)
      alert("Failed to create product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-card border-border p-8 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Wireless Headphones"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your product..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="electronics">Electronics</option>
              <option value="groceries">Groceries</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
              <option value="home">Home</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Product Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-w-xs h-48 object-cover rounded-lg border border-border"
                />
              </div>
            )}
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold disabled:opacity-50"
        >
          {loading ? "Adding Product..." : "Add Product"}
        </Button>
      </form>
    </Card>
  )
}
