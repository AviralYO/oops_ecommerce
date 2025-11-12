"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/currency"

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface ShoppingCartProps {
  items: CartItem[]
  onRemove: (productId: string) => void
  onUpdateQuantity: (productId: string, quantity: number) => void
}

export default function ShoppingCart({ items, onRemove, onUpdateQuantity }: ShoppingCartProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.18 // 18% GST in India
  const total = subtotal + tax

  return (
    <Card className="bg-card border-border sticky top-20 p-6">
      <h2 className="text-xl font-bold mb-4">Shopping Cart</h2>

      {items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Your cart is empty</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-96 overflow-y-auto mb-6">
            {items.map((item) => (
              <div key={item.id} className="border-b border-border pb-4 last:border-0">
                <div className="flex gap-4">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.name}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{formatCurrency(item.price)}</p>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 rounded bg-input border border-border hover:bg-accent"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 rounded bg-input border border-border hover:bg-accent"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="ml-auto text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>GST (18%):</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t border-border pt-4">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <Button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold mt-4">
              Checkout
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
