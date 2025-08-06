"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'INVESTIGATOR' | 'SUPERVISOR' | 'ADMIN'
}

interface AuthContextType {
  user: User | null
  login: (user: User) => void
  logout: () => void
  isLoading: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Role-based permissions
  const rolePermissions = {
    INVESTIGATOR: [
      'view_cases',
      'create_evidence',
      'create_transcription',
      'view_analytics'
    ],
    SUPERVISOR: [
      'view_cases',
      'create_evidence',
      'create_transcription',
      'view_analytics',
      'manage_cases',
      'generate_reports',
      'view_all_cases'
    ],
    ADMIN: [
      'view_cases',
      'create_evidence',
      'create_transcription',
      'view_analytics',
      'manage_cases',
      'generate_reports',
      'view_all_cases',
      'manage_users',
      'system_settings',
      'audit_logs'
    ]
  }

  useEffect(() => {
    // Check for existing user session on app load
    const checkAuth = () => {
      try {
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const userData = JSON.parse(userStr)
          setUser(userData)
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        localStorage.removeItem('user')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (userData: User) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    // Redirect to login page
    window.location.href = '/login'
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return rolePermissions[user.role].includes(permission)
  }

  const value = {
    user,
    login,
    logout,
    isLoading,
    hasPermission
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}