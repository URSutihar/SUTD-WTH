import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Plus, History, Settings, User } from 'lucide-react'
import clsx from 'clsx'

const Navigation: React.FC = () => {
  const location = useLocation()

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      exact: true
    },
    {
      path: '/new-trip',
      icon: Plus,
      label: 'New Trip'
    },
    {
      path: '/history',
      icon: History,
      label: 'History'
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile'
    }
  ]

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path
    }
    return location.pathname.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path, item.exact)
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  'flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1',
                  active
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <Icon className={clsx(
                  'w-5 h-5 mb-1',
                  active && 'text-primary-600 dark:text-primary-400'
                )} />
                <span className={clsx(
                  'text-xs font-medium truncate',
                  active && 'text-primary-600 dark:text-primary-400'
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

export default Navigation
