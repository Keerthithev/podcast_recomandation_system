import React, { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useAuthStore } from '../stores/authStore'

const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { initializeAuth, isAuthenticated } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
    }
  }, [isAuthenticated, navigate])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

export default Layout
