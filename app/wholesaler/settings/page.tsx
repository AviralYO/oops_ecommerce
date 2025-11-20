"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import WholesalerLayout from "@/components/wholesaler/wholesaler-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function WholesalerSettings() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    companyName: "",
    gstNumber: "",
    minOrderValue: "",
  })

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, loading, router])

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        companyName: user.company_name || "",
        gstNumber: user.gst_number || "",
        minOrderValue: user.min_order_value || "",
      })
    }
  }, [user])

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user || user.role !== "wholesaler") {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    toast({
      title: "Settings Updated",
      description: "Your settings have been saved successfully",
    })
  }

  return (
    <WholesalerLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your business settings and preferences</p>
        </div>

        <Card className="bg-card border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Enter your company name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="name">Contact Person</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter contact person name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                    className="mt-1"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="address">Business Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your business address"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    placeholder="Enter GST number"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="minOrderValue">Minimum Order Value (₹)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="Enter minimum order value"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive order updates via email</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Retailer Requests</p>
                    <p className="text-sm text-muted-foreground">Get notified when retailers want to connect</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Order Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive notifications for new orders</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Stock Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about low stock levels</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/wholesaler")}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>

        <Card className="bg-card border-border p-6 border-red-200">
          <h3 className="text-lg font-semibold mb-2 text-red-600">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </Card>
      </div>
    </WholesalerLayout>
  )
}
