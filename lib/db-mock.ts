// Mock in-memory database for development
// In production, replace with real database (Supabase, Neon, etc.)

interface StoredUser {
  id: string
  name: string
  email: string
  password: string // In production: NEVER store plaintext passwords
  role: "customer" | "retailer" | "wholesaler"
  createdAt: Date
}

// In-memory storage (resets on server restart)
const users: StoredUser[] = [
  {
    id: "user-1",
    name: "John Doe",
    email: "customer@example.com",
    password: "password123", // Demo only - hash in production
    role: "customer",
    createdAt: new Date(),
  },
  {
    id: "user-2",
    name: "Store Owner",
    email: "retailer@example.com",
    password: "password123",
    role: "retailer",
    createdAt: new Date(),
  },
  {
    id: "user-3",
    name: "Wholesale Manager",
    email: "wholesaler@example.com",
    password: "password123",
    role: "wholesaler",
    createdAt: new Date(),
  },
]

const sessions: Map<string, string> = new Map() // token -> userId

export const mockDB = {
  // User operations
  findUserByEmail(email: string): StoredUser | undefined {
    return users.find((u) => u.email === email)
  },

  findUserById(id: string): StoredUser | undefined {
    return users.find((u) => u.id === id)
  },

  createUser(name: string, email: string, password: string, role: string): StoredUser {
    const newUser: StoredUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      password, // Hash this in production!
      role: role as "customer" | "retailer" | "wholesaler",
      createdAt: new Date(),
    }
    users.push(newUser)
    console.log("[v0] Created user:", newUser.email)
    return newUser
  },

  // Session operations
  createSession(userId: string): string {
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    sessions.set(token, userId)
    console.log("[v0] Session created for user:", userId)
    return token
  },

  getSessionUser(token: string): StoredUser | undefined {
    const userId = sessions.get(token)
    if (!userId) return undefined
    return this.findUserById(userId)
  },

  deleteSession(token: string): void {
    sessions.delete(token)
    console.log("[v0] Session deleted")
  },

  // Get all sessions (for debugging)
  getAllSessions(): Map<string, string> {
    return sessions
  },
}
