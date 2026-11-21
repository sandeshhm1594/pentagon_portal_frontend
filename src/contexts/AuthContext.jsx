import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('userId')
    const username = localStorage.getItem('username')
    
    // Clear session if on homepage
    if (window.location.pathname === '/') {
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      setUser(null)
      setLoading(false)
      return
    }
    
    // Only restore session if not on homepage
    if (token && role) {
      setUser({ token, role, userId, username })
    }
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password })
      const { token, role, userId, username: loggedInUser } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('role', role)
      localStorage.setItem('userId', userId)
      localStorage.setItem('username', loggedInUser)
      
      setUser({ token, role, userId, username: loggedInUser })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
