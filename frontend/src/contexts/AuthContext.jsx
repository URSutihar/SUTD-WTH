import { createContext, useContext, useState } from 'react'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  // Mock user for development - no authentication required
  const [user] = useState({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@snorelags.com',
    name: 'Demo User'
  })
  const [loading] = useState(false)

  const signOut = async () => {
    // No-op since there's no authentication
    console.log('Sign out called (no-op)')
  }

  const value = {
    user,
    loading,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
