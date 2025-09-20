import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import localforage from 'localforage'
import { apiClient } from '../services/apiClient'

interface User {
  id: string
  email: string
  name: string
  timezone: string
  chronotype: 'morning' | 'evening' | 'neutral'
  sensitivity: 'low' | 'medium' | 'high'
  created_at: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (code: string) => Promise<void>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const queryClient = useQueryClient()

  // Check for stored auth token on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await localforage.getItem<string>('auth_token')
        if (token) {
          // Verify token with backend
          const userData = await apiClient.getUser()
          setUser(userData)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        await localforage.removeItem('auth_token')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiClient.authenticateWithGoogle(code)
      await localforage.setItem('auth_token', response.access_token)
      return response
    },
    onSuccess: (data) => {
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
    onError: (error) => {
      console.error('Login failed:', error)
    }
  })

  const login = async (code: string) => {
    await loginMutation.mutateAsync(code)
  }

  const logout = async () => {
    setUser(null)
    await localforage.removeItem('auth_token')
    queryClient.clear()
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
