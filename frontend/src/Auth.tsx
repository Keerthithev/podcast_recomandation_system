import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Auth({ onAuthed, onAdminAuthed }: { onAuthed: () => void, onAdminAuthed: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      if (isAdmin) {
        // Admin login
        const r = await fetch(`${API_BASE}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email, password }),
        })
        if (!r.ok) throw new Error('Invalid admin credentials')
        const data = await r.json()
        localStorage.setItem('admin_token', data.access_token)
        localStorage.setItem('admin_user', JSON.stringify({ username: data.username, admin_id: data.admin_id }))
        onAdminAuthed()
      } else {
        // Regular user login/register
        const path = isLogin ? 'login' : 'register'
        const body: any = { email, password }
        if (!isLogin) body.name = name
        const r = await fetch(`${API_BASE}/auth/${path}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (!r.ok) throw new Error('Request failed')
        const data = await r.json()
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        onAuthed()
      }
    } catch (e: any) {
      setError(e?.message || 'Failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <div className="text-center mb-6">
          <img 
            src="/logo.png" 
            alt="Podify" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h2 className="text-xl font-semibold">
            {isAdmin ? 'Admin Login' : (isLogin ? 'User Login' : 'User Register')}
          </h2>
        </div>

        {/* Admin/User Toggle */}
        <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setIsAdmin(false)}
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
              !isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            User
          </button>
          <button
            onClick={() => setIsAdmin(true)}
            className={`flex-1 py-2 px-3 text-sm rounded-md transition-colors ${
              isAdmin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Admin
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          {!isLogin && !isAdmin && (
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input 
                className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" 
                value={name} 
                onChange={e=>setName(e.target.value)} 
                placeholder="Enter your name"
              />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">
              {isAdmin ? 'Username' : 'Email'}
            </label>
            <input 
              type={isAdmin ? 'text' : 'email'} 
              className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" 
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              placeholder={isAdmin ? 'Enter admin username' : 'Enter your email'}
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input 
              type="password" 
              className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" 
              value={password} 
              onChange={e=>setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            {isAdmin ? 'Admin Login' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {!isAdmin && (
          <button 
            onClick={()=>setIsLogin(!isLogin)} 
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-800"
          >
            {isLogin ? 'Create an account' : 'Have an account? Login'}
          </button>
        )}

        {isAdmin && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Default Admin Credentials:</h3>
            <p className="text-sm text-gray-600">Username: <code className="bg-gray-200 px-1 rounded">admin</code></p>
            <p className="text-sm text-gray-600">Password: <code className="bg-gray-200 px-1 rounded">admin123</code></p>
          </div>
        )}
      </div>
    </div>
  )
}


