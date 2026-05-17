import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// V-01/V-12: bloco demo só visível em modo desenvolvimento (VITE DEV)
const IS_DEV = import.meta.env.DEV

const DEMO_CONTAS = [
  { label: 'Aluno',     email: 'joao@aluno.edu',      cor: '#10b981' },
  { label: 'Orientador',email: 'maria@prof.edu',       cor: '#8b5cf6' },
  { label: 'Comissão',  email: 'carlos@comissao.edu',  cor: '#f59e0b' },
]

export default function LoginPage() {
  const [email,   setEmail]   = useState('')
  const [senha,   setSenha]   = useState('')
  const [erro,    setErro]    = useState('')
  const [loading, setLoading] = useState(false)
  const { login }   = useAuth()
  const navigate    = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await login(email, senha)
      navigate('/')
    } catch (err) {
      setErro(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#1e40af"/>
            <path d="M8 20 L20 8 L32 20 L20 32 Z" fill="white" opacity="0.9"/>
            <circle cx="20" cy="20" r="5" fill="#3b82f6"/>
          </svg>
          <h1 style={s.title}>ExtensFlow</h1>
          <p style={s.subtitle}>Sistema de Avaliação de Projetos de Extensão</p>
        </div>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.edu" required style={s.input} autoComplete="email" />
          </div>
          <div style={s.field}>
            <label style={s.label}>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••••" required style={s.input} autoComplete="current-password" />
          </div>

          {erro && <div style={s.erro} role="alert">{erro}</div>}

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        {/* V-12: bloco de demo apenas em desenvolvimento — nunca exposto em produção */}
        {IS_DEV && (
          <div style={s.demoBox}>
            <p style={s.demoTitle}>Contas de demonstração (dev)</p>
            <div style={s.demoList}>
              {DEMO_CONTAS.map(c => (
                <button key={c.email} type="button"
                  onClick={() => { setEmail(c.email); setSenha(import.meta.env.VITE_SEED_SENHA || '') }}
                  style={s.demoItem}>
                  <span style={{ ...s.badge, background: c.cor }}>{c.label}</span>
                  {c.email}
                </button>
              ))}
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
              Configure VITE_SEED_SENHA no .env.local
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

const s = {
  page: { minHeight:'100vh', background:'linear-gradient(135deg,#1e3a8a,#1e40af,#3b82f6)',
    display:'flex', alignItems:'center', justifyContent:'center', padding:20 },
  card: { background:'white', borderRadius:16, padding:'40px 36px', width:'100%',
    maxWidth:400, boxShadow:'0 25px 50px rgba(0,0,0,0.25)' },
  header: { textAlign:'center', marginBottom:28 },
  title: { fontSize:24, fontWeight:700, color:'#111827', margin:'12px 0 4px' },
  subtitle: { fontSize:13, color:'#6b7280', margin:0 },
  form: { display:'flex', flexDirection:'column', gap:16 },
  field: { display:'flex', flexDirection:'column', gap:6 },
  label: { fontSize:13, fontWeight:500, color:'#374151' },
  input: { border:'1px solid #d1d5db', borderRadius:8, padding:'10px 14px',
    fontSize:14, outline:'none', width:'100%' },
  erro: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
    borderRadius:8, padding:'10px 14px', fontSize:13 },
  btn: { background:'#1e40af', color:'white', border:'none', borderRadius:8,
    padding:'12px 24px', fontSize:15, fontWeight:600, cursor:'pointer', marginTop:4 },
  demoBox: { marginTop:20, padding:14, background:'#f8fafc', borderRadius:10,
    border:'1px solid #e2e8f0' },
  demoTitle: { fontSize:12, fontWeight:600, color:'#64748b', marginBottom:8, margin:'0 0 8px' },
  demoList: { display:'flex', flexDirection:'column', gap:6 },
  demoItem: { display:'flex', alignItems:'center', gap:8, fontSize:12, color:'#374151',
    cursor:'pointer', padding:'5px 8px', borderRadius:6, background:'none',
    border:'none', textAlign:'left', width:'100%' },
  badge: { color:'white', borderRadius:4, padding:'2px 8px',
    fontSize:11, fontWeight:600, whiteSpace:'nowrap' }
}
