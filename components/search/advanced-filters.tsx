"use client"

import React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FilterOption {
  id: string
  label: string
  count: number
}

interface AdvancedFiltersProps {
  onFilterChange?: (filters: Record<string, string[]>) => void
}

export default function AdvancedFilters({ onFilterChange }: AdvancedFiltersProps) {
  const [selectedFilters, setSelectedFilters] = React.useState<Record<string, string[]>>({})

  const filterGroups = {
    "Stock Status": [
      { id: "in-stock", label: "In Stock", count: 245 },
      { id: "low-stock", label: "Low Stock", count: 32 },
      { id: "pre-order", label: "Pre-Order", count: 18 },
    ],
    Rating: [
      { id: "5star", label: "5 Stars", count: 156 },
      { id: "4plus", label: "4+ Stars", count: 289 },
      { id: "3plus", label: "3+ Stars", count: 412 },
    ],
    Seller: [
      { id: "verified", label: "Verified Seller", count: 387 },
      { id: "new", label: "New Seller", count: 45 },
      { id: "premium", label: "Premium", count: 98 },
    ],
  }

  const toggleFilter = (group: string, filterId: string) => {
    const updated = { ...selectedFilters }
    if (!updated[group]) updated[group] = []
    if (updated[group].includes(filterId)) {
      updated[group] = updated[group].filter((f) => f !== filterId)
    } else {
      updated[group].push(filterId)
    }
    setSelectedFilters(updated)
    onFilterChange?.(updated)
  }

  return (
    <Card className="bg-card border-border p-6">
      <h3 className="text-lg font-bold mb-4">Advanced Filters</h3>
      <div className="space-y-6">
        {Object.entries(filterGroups).map(([groupName, options]) => (
          <div key={groupName}>
            <h4 className="font-semibold text-sm mb-3">{groupName}</h4>
            <div className="space-y-2">
              {options.map((option) => (
                <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters[groupName]?.includes(option.id) || false}
                    onChange={() => toggleFilter(groupName, option.id)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{option.label}</span>
                  <span className="text-xs text-muted-foreground ml-auto">({option.count})</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <Button
          onClick={() => {
            setSelectedFilters({})
            onFilterChange?.({})
          }}
          variant="outline"
          className="w-full"
        >
          Clear All Filters
        </Button>
      </div>
    </Card>
  )
}
