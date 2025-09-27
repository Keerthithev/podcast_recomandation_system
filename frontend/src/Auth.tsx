import React, { useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export default function Auth({ onAuthed }: { onAuthed: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
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
    } catch (e: any) {
      setError(e?.message || 'Failed')
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-lg border bg-white p-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">{isLogin ? 'Login' : 'Register'}</h2>
        <form onSubmit={submit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-sm mb-1">Name</label>
              <input className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" className="w-full rounded border px-3 py-2 dark:bg-gray-800 dark:border-gray-700" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full px-4 py-2 rounded bg-indigo-600 text-white">{isLogin ? 'Login' : 'Register'}</button>
        </form>
        <button onClick={()=>setIsLogin(!isLogin)} className="mt-3 text-sm text-indigo-600">{isLogin ? 'Create an account' : 'Have an account? Login'}</button>
      </div>
    </div>
  )
}


