import React from 'react'
import { NavLink } from 'react-router-dom'
import { 
  Home, 
  Sparkles, 
  Search, 
  Heart, 
  User, 
  Settings,
  BarChart3,
  Brain
} from 'lucide-react'

const Sidebar = () => {
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Recommendations', href: '/recommendations', icon: Sparkles },
    { name: 'Search', href: '/search', icon: Search },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const secondaryNavigation = [
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Agents', href: '/agents', icon: Brain },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">PodcastAI</h1>
            <p className="text-xs text-gray-500">AI-Powered Recommendations</p>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main
          </p>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Secondary Navigation */}
        <nav className="mt-8 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Tools
          </p>
          {secondaryNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* AI Status */}
        <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">AI Agents Active</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            Multi-agent system running
          </p>
        </div>
      </div>
    </div>
  )
}

export default Sidebar
