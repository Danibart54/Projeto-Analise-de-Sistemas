import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  /**
   * V-04: Sessão em memória React (perdida ao fechar aba — intencional).
   * O JWT fica em sessionStorage (não localStorage) como camada de conveniência
   * de persistência entre renders, mas nunca exposto em X-User-Id.
   * Para máxima segurança em produção: use HttpOnly cookie no backend.
   */
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('extensflow_session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, senha) => {
    const data = await loginApi({ email, senha })
    // Armazenar token separado dos dados de exibição
    sessionStorage.setItem('extensflow_token', data.token)
    // Dados de UI sem o token
    const sessao = { nome: data.nome, email: data.email, perfil: data.perfil }
    sessionStorage.setItem('extensflow_session', JSON.stringify(sessao))
    setUser(sessao)
    return sessao
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('extensflow_token')
    sessionStorage.removeItem('extensflow_session')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
