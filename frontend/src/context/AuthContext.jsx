import { createContext, useContext, useState, useCallback } from 'react'
import { login as loginApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = sessionStorage.getItem('apo_session') || sessionStorage.getItem('extensflow_session')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const login = useCallback(async (email, senha) => {
    const data = await loginApi({ email, senha })
    sessionStorage.setItem('extensflow_token', data.token)

    const funcoes = data.funcoes && data.funcoes.length > 0 ? data.funcoes : [data.perfil]
    const sessao = {
      nome:        data.nome,
      email:       data.email,
      perfil:      data.perfil,
      perfilAtivo: funcoes.length === 1 ? funcoes[0] : null,
      funcoes:     funcoes,
      admin:       data.admin ?? false,
      id:          data.id ?? null,
    }
    sessionStorage.setItem('apo_session', JSON.stringify(sessao))
    sessionStorage.setItem('extensflow_session', JSON.stringify(sessao))
    setUser(sessao)
    return sessao
  }, [])

  const selecionarPerfil = useCallback((perfil) => {
    setUser(prev => {
      const atualizado = { ...prev, perfilAtivo: perfil }
      sessionStorage.setItem('apo_session', JSON.stringify(atualizado))
      sessionStorage.setItem('extensflow_session', JSON.stringify(atualizado))
      return atualizado
    })
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem('extensflow_token')
    sessionStorage.removeItem('extensflow_session')
    sessionStorage.removeItem('apo_session')
    setUser(null)
  }, [])

  // Perfil efetivo: o selecionado, ou o prioritário do JWT
  const perfilEfetivo = user
    ? (user.perfilAtivo || user.perfil || 'ALUNO').toUpperCase()
    : null

  return (
    <AuthContext.Provider value={{ user, login, logout, selecionarPerfil, perfilEfetivo }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
