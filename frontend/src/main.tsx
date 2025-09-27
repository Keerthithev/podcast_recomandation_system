import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Auth from './Auth'

export type User = { id: string; email: string; name?: string }

function Root() {
  const tokenInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  const userInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
  const [authed, setAuthed] = React.useState(!!tokenInStorage)
  const [user, setUser] = React.useState<User | null>(userInStorage ? JSON.parse(userInStorage) : null)

  function handleAuthed() {
    const u = localStorage.getItem('user')
    setUser(u ? JSON.parse(u) : null)
    setAuthed(true)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setAuthed(false)
  }

  return authed ? <App user={user} onLogout={handleLogout} /> : <Auth onAuthed={handleAuthed} />
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
