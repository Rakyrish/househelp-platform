import {
  createContext,
  useState,
  useContext,
  type ReactNode,
  useEffect,
} from 'react'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

interface User {
  name: string
  role: 'worker' | 'employer' | 'admin'
}

interface LoginCredentials {
  phone: string
  password: string
  type: 'worker' | 'employer' | 'admin'
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
      api.defaults.headers.common['Authorization'] = `Token ${storedToken}`
    }

    setLoading(false)
  }, [])

  const login = async ({ phone, password, type }: LoginCredentials) => {
    const payload = { phone, password }

    const { data } = await api.post(`/login/${type}/`, payload)

    const authUser: User = {
      name: data.name,
      role: data.role,
    }

    setUser(authUser)
    setToken(data.token)

    localStorage.setItem('user', JSON.stringify(authUser))
    localStorage.setItem('token', data.token)

    api.defaults.headers.common['Authorization'] = `Token ${data.token}`
  }

  const logout = () => {
    setUser(null)
    setToken(null)

    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('user')
    localStorage.removeItem('token')

    navigate('/')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return ctx
}
