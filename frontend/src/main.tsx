import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import Auth from './Auth'
import AdminPage from './AdminPage'

export type User = { id: string; email: string; name?: string }
export type AdminUser = { username: string; admin_id: string }

function Root() {
  const tokenInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
  const userInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('user') : null
  const adminTokenInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_token') : null
  const adminUserInStorage = typeof localStorage !== 'undefined' ? localStorage.getItem('admin_user') : null
  
  const [authed, setAuthed] = React.useState(!!tokenInStorage)
  const [adminAuthed, setAdminAuthed] = React.useState(!!adminTokenInStorage)
  const [user, setUser] = React.useState<User | null>(userInStorage ? JSON.parse(userInStorage) : null)
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(adminUserInStorage ? JSON.parse(adminUserInStorage) : null)

  function handleAuthed() {
    const u = localStorage.getItem('user')
    setUser(u ? JSON.parse(u) : null)
    setAuthed(true)
  }

  function handleAdminAuthed() {
    const a = localStorage.getItem('admin_user')
    setAdminUser(a ? JSON.parse(a) : null)
    setAdminAuthed(true)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setAuthed(false)
  }

  function handleAdminLogout() {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_user')
    setAdminUser(null)
    setAdminAuthed(false)
  }

  if (adminAuthed) {
    return <AdminPage onLogout={handleAdminLogout} />
  }

  if (authed) {
    return <App user={user} onLogout={handleLogout} />
  }

  return <Auth onAuthed={handleAuthed} onAdminAuthed={handleAdminAuthed} />
}

const container = document.getElementById('root')!
const root = createRoot(container)
root.render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
