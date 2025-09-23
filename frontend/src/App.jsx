import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Recommendations from './pages/Recommendations'
import Search from './pages/Search'
import Favorites from './pages/Favorites'
import Profile from './pages/Profile'
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { isAuthenticated, isLoading } = useAuthStore()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} />
        <Route path="/recommendations" element={isAuthenticated ? <Layout><Recommendations /></Layout> : <Navigate to="/login" />} />
        <Route path="/search" element={isAuthenticated ? <Layout><Search /></Layout> : <Navigate to="/login" />} />
        <Route path="/favorites" element={isAuthenticated ? <Layout><Favorites /></Layout> : <Navigate to="/login" />} />
        <Route path="/profile" element={isAuthenticated ? <Layout><Profile /></Layout> : <Navigate to="/login" />} />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  )
}

export default App
