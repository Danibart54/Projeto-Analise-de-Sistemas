import { useState, useEffect } from 'react'
import { listarAlunos, listarOrientadores, listarMembros, cadastrarUsuarioAdmin } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Comprimentos máximos espelhando as constraints do backend
const MAX = { nome: 150, email: 254, senha: 128, matricula: 20, curso: 100,
              areaAtuacao: 100, titulacao: 50, especialidade: 100, instituicao: 150 }

const TIPOS_VALIDOS = ['orientador', 'membro_comissao']

const FORM_INICIAL = {
  nome: '', email: '', senha: '', tipo: 'orientador',
  matricula: '', curso: '', areaAtuacao: '', titulacao: '',
  especialidade: '', instituicao: ''
}

export default function UsuariosPage() {
  const { user } = useAuth()
  const [aba, setAba] = useState('alunos')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [msg, setMsg] = useState('')
  const [erros, setErros] = useState({})
  const [form, setForm] = useState(FORM_INICIAL)

  useEffect(() => { loadUsers() }, [aba])

  async function loadUsers() {
    setLoading(true)
    try {
      const fn = aba === 'alunos' ? listarAlunos
               : aba === 'orientadores' ? listarOrientadores
               : listarMembros
      setUsers(await fn())
    } catch (e) { setMsg('Erro: ' + e.message) }
    finally { setLoading(false) }
  }

  function set(f, v) {
    // Respeitar o limite de caracteres no frontend antes de enviar ao servidor
    const max = MAX[f]
    if (max && v.length > max) return
    setForm(p => ({ ...p, [f]: v }))
    if (erros[f]) setErros(p => ({ ...p, [f]: null }))
  }

  function validar() {
    const e = {}
    if (!form.nome.trim() || form.nome.length < 2) e.nome = 'Nome deve ter ao menos 2 caracteres'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!form.senha || form.senha.length < 8) e.senha = 'Senha deve ter ao menos 8 caracteres'
    if (!TIPOS_VALIDOS.includes(form.tipo)) e.tipo = 'Tipo inválido'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errosValidacao = validar()
    if (Object.keys(errosValidacao).length > 0) { setErros(errosValidacao); return }

    try {
      // Usa /usuarios/admin — restrito à Secretaria no backend
      await cadastrarUsuarioAdmin({
        nome: form.nome.trim(),
        email: form.email.trim().toLowerCase(),
        senha: form.senha,
        tipo: form.tipo,
        areaAtuacao: form.areaAtuacao.trim(),
        titulacao: form.titulacao.trim(),
        especialidade: form.especialidade.trim(),
        instituicao: form.instituicao.trim(),
      })
      setMsg('✅ Usuário cadastrado!')
      setShowForm(false)
      setForm(FORM_INICIAL)
      loadUsers()
    } catch (err) { setMsg('❌ ' + err.message) }
  }

  const ABAS = [
    { key: 'alunos',       label: '🎓 Alunos' },
    { key: 'orientadores', label: '👨‍🏫 Orientadores' },
    { key: 'membros',      label: '⚖️ Comissão' },
  ]

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>Usuários</h1>
        <button onClick={() => setShowForm(true)} style={s.primaryBtn}>+ Cadastrar</button>
      </div>

      {msg && (
        <div style={{ ...s.alert,
          background:   msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          borderColor:  msg.startsWith('✅') ? '#86efac' : '#fecaca',
          color:        msg.startsWith('✅') ? '#166534' : '#dc2626' }}>
          {msg}
          <button onClick={() => setMsg('')} style={s.alertClose}>×</button>
        </div>
      )}

      <div style={s.tabs}>
        {ABAS.map(a => (
          <button key={a.key} onClick={() => setAba(a.key)}
            style={{ ...s.tab, ...(aba === a.key ? s.tabActive : {}) }}>
            {a.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={s.empty}>Carregando...</div>
      ) : users.length === 0 ? (
        <div style={s.empty}>Nenhum usuário encontrado</div>
      ) : (
        <div style={s.table}>
          <div style={s.tableHeader}>
            {['Nome','E-mail','Detalhes','Status'].map(h => (
              <div key={h} style={s.th}>{h}</div>
            ))}
          </div>
          {users.map(u => (
            <div key={u.id} style={s.tr}>
              <div style={s.td}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ ...s.avatar, background:'#1e40af' }}>
                    {u.nome?.charAt(0)?.toUpperCase()}
                  </div>
                  {/* React escapa automaticamente — não há risco de XSS aqui */}
                  <span style={{ fontWeight:500 }}>{u.nome}</span>
                </div>
              </div>
              <div style={s.td}>{u.email}</div>
              <div style={s.td}>
                {u.matricula  && <span>{u.matricula} — {u.curso}</span>}
                {u.titulacao  && <span>{u.titulacao} — {u.areaAtuacao}</span>}
                {u.especialidade && <span>{u.especialidade}</span>}
              </div>
              <div style={s.td}>
                <span style={{ ...s.badge, ...(u.ativo ? s.badgeGreen : s.badgeGray) }}>
                  {u.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={s.modal}>
          <div style={s.modalContent}>
            <div style={s.modalHeader}>
              <h2 style={{ fontSize:18, fontWeight:700 }}>Cadastrar Usuário</h2>
              <button onClick={() => { setShowForm(false); setErros({}) }} style={s.closeBtn}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

              <Campo label="Tipo *" erro={erros.tipo}>
                <select value={form.tipo} onChange={e => set('tipo', e.target.value)} style={s.input}>
                  <option value="orientador">Orientador</option>
                  <option value="membro_comissao">Membro da Comissão</option>
                </select>
              </Campo>

              <Campo label="Nome *" erro={erros.nome}
                hint={`${form.nome.length}/${MAX.nome}`}>
                <input value={form.nome} onChange={e => set('nome', e.target.value)}
                  style={s.input} autoComplete="off" />
              </Campo>

              <Campo label="E-mail *" erro={erros.email}>
                <input type="email" value={form.email}
                  onChange={e => set('email', e.target.value)}
                  style={s.input} autoComplete="off" />
              </Campo>

              <Campo label="Senha *" erro={erros.senha}
                hint="Mínimo 8 caracteres">
                <input type="password" value={form.senha}
                  onChange={e => set('senha', e.target.value)}
                  style={s.input} autoComplete="new-password"
                  maxLength={MAX.senha} />
              </Campo>

              {form.tipo === 'orientador' && <>
                <Campo label="Área de Atuação">
                  <input value={form.areaAtuacao}
                    onChange={e => set('areaAtuacao', e.target.value)}
                    style={s.input} maxLength={MAX.areaAtuacao} />
                </Campo>
                <Campo label="Titulação">
                  <input value={form.titulacao}
                    onChange={e => set('titulacao', e.target.value)}
                    style={s.input} maxLength={MAX.titulacao} />
                </Campo>
              </>}

              {form.tipo === 'membro_comissao' && <>
                <Campo label="Especialidade">
                  <input value={form.especialidade}
                    onChange={e => set('especialidade', e.target.value)}
                    style={s.input} maxLength={MAX.especialidade} />
                </Campo>
                <Campo label="Instituição">
                  <input value={form.instituicao}
                    onChange={e => set('instituicao', e.target.value)}
                    style={s.input} maxLength={MAX.instituicao} />
                </Campo>
              </>}

              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:8 }}>
                <button type="button"
                  onClick={() => { setShowForm(false); setErros({}) }}
                  style={s.cancelBtn}>Cancelar</button>
                <button type="submit" style={s.primaryBtn}>Cadastrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({ label, erro, hint, children }) {
  return (
    <div>
      <label style={s.label}>{label}</label>
      {children}
      {hint  && !erro && <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>{hint}</div>}
      {erro  && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{erro}</div>}
    </div>
  )
}

const s = {
  pageHeader:   { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 },
  pageTitle:    { fontSize:24, fontWeight:700, color:'#111827' },
  primaryBtn:   { background:'#1e40af', color:'white', border:'none', borderRadius:8,
                  padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' },
  alert:        { border:'1px solid', borderRadius:10, padding:'12px 16px', marginBottom:20,
                  fontSize:14, display:'flex', justifyContent:'space-between', alignItems:'center' },
  alertClose:   { background:'none', border:'none', cursor:'pointer', fontSize:20, color:'inherit' },
  tabs:         { display:'flex', gap:4, marginBottom:20, background:'#f3f4f6',
                  borderRadius:10, padding:4, width:'fit-content' },
  tab:          { background:'none', border:'none', padding:'8px 16px', borderRadius:8,
                  cursor:'pointer', fontSize:14, color:'#6b7280', fontWeight:500 },
  tabActive:    { background:'white', color:'#111827', boxShadow:'0 1px 3px rgba(0,0,0,0.1)' },
  empty:        { textAlign:'center', padding:48, color:'#9ca3af' },
  table:        { background:'white', borderRadius:12, overflow:'hidden',
                  boxShadow:'0 1px 3px rgba(0,0,0,0.08)' },
  tableHeader:  { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 100px',
                  background:'#f9fafb', padding:'12px 20px', borderBottom:'1px solid #e5e7eb' },
  th:           { fontSize:12, fontWeight:600, color:'#6b7280',
                  textTransform:'uppercase', letterSpacing:'.05em' },
  tr:           { display:'grid', gridTemplateColumns:'1fr 1fr 1fr 100px',
                  padding:'14px 20px', borderBottom:'1px solid #f3f4f6', alignItems:'center' },
  td:           { fontSize:14, color:'#374151' },
  avatar:       { width:32, height:32, borderRadius:'50%', display:'flex',
                  alignItems:'center', justifyContent:'center',
                  color:'white', fontWeight:700, fontSize:13, flexShrink:0 },
  badge:        { display:'inline-block', fontSize:11, fontWeight:600,
                  padding:'3px 10px', borderRadius:20 },
  badgeGreen:   { background:'#f0fdf4', color:'#10b981' },
  badgeGray:    { background:'#f3f4f6', color:'#6b7280' },
  modal:        { position:'fixed', inset:0, background:'rgba(0,0,0,0.5)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  zIndex:1000, padding:20 },
  modalContent: { background:'white', borderRadius:16, padding:28, width:'100%',
                  maxWidth:480, maxHeight:'90vh', overflowY:'auto' },
  modalHeader:  { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 },
  closeBtn:     { background:'none', border:'none', fontSize:24, cursor:'pointer',
                  color:'#6b7280', lineHeight:1 },
  label:        { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:5 },
  input:        { width:'100%', border:'1px solid #d1d5db', borderRadius:8,
                  padding:'10px 14px', fontSize:14, outline:'none',
                  background:'white', fontFamily:'inherit', boxSizing:'border-box' },
  cancelBtn:    { background:'white', color:'#374151', border:'1px solid #d1d5db',
                  borderRadius:8, padding:'10px 20px', fontSize:14, cursor:'pointer', fontWeight:500 },
}
