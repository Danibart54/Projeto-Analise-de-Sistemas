import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  return (
    <div style={s.page}>
      <div style={s.blob1} />
      <div style={s.blob2} />
      <div style={s.card}>
        <div style={s.logoArea}>
          <div style={s.logoIcon}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <div style={s.logoName}>APO PPGCA</div>
            <div style={s.logoSub}>Atividade Programada Obrigatória</div>
          </div>
        </div>

        <div style={s.divider} />

        <FormLogin login={login} navigate={navigate} />

        <p style={s.footer}>
          Universidade Presbiteriana Mackenzie · PPGCA · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

function FormLogin({ login, navigate }) {
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const sessao = await login(email, senha)
      const funcoes = sessao.funcoes || [sessao.perfil]
      const precisaSelecionar = funcoes.length > 1 && !sessao.perfilAtivo
      navigate(precisaSelecionar ? '/selecionar-perfil' : '/')
    } catch (err) {
      setErro(err.message || 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={s.form}>
      <h2 style={s.title}>Bem-vindo de volta</h2>
      <p style={s.subtitle}>Acesse sua conta institucional</p>

      <Campo label="E-mail institucional">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="seu@email.edu.br" required style={s.input}
          autoComplete="email" disabled={loading} />
      </Campo>

      <Campo label="Senha">
        <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
          placeholder="••••••••" required style={s.input}
          autoComplete="current-password" disabled={loading} />
      </Campo>

      {erro && <Alerta>{erro}</Alerta>}

      <button type="submit" disabled={loading}
        style={{ ...s.btn, ...(loading ? s.btnLoading : {}) }}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>

      <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12 }}>
        Não tem acesso? Solicite ao seu orientador ou ao administrador do sistema.
      </div>
    </form>
  )
}

function Campo({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={s.label}>{label}</label>
      {children}
    </div>
  )
}

function Alerta({ children }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
      borderRadius: 9, padding: '9px 12px', fontSize: 13, marginBottom: 4,
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="#dc2626" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {children}
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 20, position: 'relative', overflow: 'hidden',
  },
  blob1: {
    position: 'absolute', width: 400, height: 400, borderRadius: '50%',
    top: '-80px', right: '-80px',
    background: 'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  blob2: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    bottom: '-60px', left: '-60px',
    background: 'radial-gradient(circle, rgba(124,58,237,.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  card: {
    background: 'rgba(255,255,255,.97)',
    backdropFilter: 'blur(20px)',
    borderRadius: 20, padding: '36px 40px',
    width: '100%', maxWidth: 440,
    boxShadow: '0 32px 64px rgba(0,0,0,.35)',
    position: 'relative', zIndex: 1,
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 },
  logoIcon: {
    width: 44, height: 44, background: '#2563eb', borderRadius: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  logoName: { fontSize: 18, fontWeight: 700, color: '#0f172a', letterSpacing: '-.02em', lineHeight: 1.2 },
  logoSub:  { fontSize: 11, color: '#94a3b8', marginTop: 1 },
  divider:  { height: 1, background: '#f1f5f9', marginBottom: 24 },
  title:    { fontSize: 18, fontWeight: 700, color: '#0f172a', marginBottom: 4, letterSpacing: '-.02em', marginTop: 0 },
  subtitle: { fontSize: 13, color: '#94a3b8', marginBottom: 20 },
  form:     { display: 'flex', flexDirection: 'column', gap: 0 },
  label:    { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5, letterSpacing: '.01em' },
  input: {
    border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14,
    outline: 'none', width: '100%', color: '#0f172a', background: '#f8fafc',
    transition: 'border-color .15s', boxSizing: 'border-box',
  },
  btn: {
    background: '#2563eb', color: 'white', border: 'none', borderRadius: 10, padding: '12px',
    fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8,
    transition: 'background .15s', letterSpacing: '.01em',
  },
  btnLoading: { background: '#93c5fd', cursor: 'not-allowed' },
  footer:   { fontSize: 11, color: '#cbd5e1', textAlign: 'center', marginTop: 20 },
}
