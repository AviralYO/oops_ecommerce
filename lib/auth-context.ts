"use client"

import { createContext, useContext } from "react"

export interface User {
  id: string
  email: string
  name: string
  role: "customer" | "retailer" | "wholesaler"
  pincode?: string
  createdAt: Date
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<User>
  signup: (name: string, email: string, password: string, role: string, pincode?: string) => Promise<User>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
