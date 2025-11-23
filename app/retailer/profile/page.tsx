"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export default function RetailerProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")
  const [pincode, setPincode] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setPincode(user.pincode || "")
    }
  }, [user])

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, pincode }),
      })

      if (response.ok) {
        setIsEditing(false)
        // Refresh the page to update user data
        window.location.reload()
      } else {
        console.error("Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/retailer")}
          className="mb-6"
        >
          ← Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Retailer Profile</CardTitle>
                <CardDescription>Manage your business information</CardDescription>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white text-3xl font-bold">
                {user.name?.charAt(0).toUpperCase() || "R"}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Business Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your business name"
                />
              ) : (
                <div className="px-3 py-2 border border-border rounded-md bg-muted">
                  {user.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="px-3 py-2 border border-border rounded-md bg-muted text-muted-foreground">
                {user.email}
              </div>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              {isEditing ? (
                <Input
                  id="pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter your business pincode (e.g., 110001)"
                  maxLength={6}
                />
              ) : (
                <div className="px-3 py-2 border border-border rounded-md bg-muted">
                  {user.pincode || "Not set"}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Your pincode helps customers find local products
              </p>
            </div>

            <div className="space-y-2">
              <Label>Account Type</Label>
              <div className="px-3 py-2 border border-border rounded-md bg-muted capitalize">
                Retailer
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false)
                      setName(user.name || "")
                      setPincode(user.pincode || "")
                    }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                >
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Business Stats */}
        <div className="grid gap-6 mt-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Business Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Products</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Orders</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-semibold">₹0</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/retailer")}
              >
                📦 Add New Product
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/retailer")}
              >
                📊 View Analytics
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push("/retailer")}
              >
                🔔 Manage Notifications
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
