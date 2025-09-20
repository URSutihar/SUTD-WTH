import React, { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import Navigation from './Navigation'
import { useAuth } from '../../context/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  
  // Hide navigation on certain pages
  const hideNavigation = ['/'].includes(location.pathname)
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className={`${isAuthenticated && !hideNavigation ? 'pb-16' : ''}`}>
        {children}
      </main>
      
      {isAuthenticated && !hideNavigation && <Navigation />}
    </div>
  )
}

export default Layout
