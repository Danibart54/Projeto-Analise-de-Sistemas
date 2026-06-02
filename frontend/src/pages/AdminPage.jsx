import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import {
  adminListarUsuarios,
  adminAtribuirFuncoes,
  adminDesativarUsuario,
  adminReativarUsuario,
  adminCriarUsuario,
} from '../services/api'
import { PageWrapper, PageHeader, PrimaryButton, OutlineButton, Avatar } from '../components/ui'

const TODAS_FUNCOES = [
  { valor: 'ALUNO',              label: 'Aluno',             cor: '#7c3aed' },
  { valor: 'SECRETARIO',         label: 'Secretário',        cor: '#2563eb' },
  { valor: 'ORIENTADOR',         label: 'Orientador',        cor: '#8b5cf6' },
  { valor: 'COORDENADOR',        label: 'Coordenador',       cor: '#d97706' },
  { valor: 'COMISSAO_JULGADORA', label: 'Comissão Julgadora',cor: '#dc2626' },
]

const FORM_VAZIO = { nome: '', email: '', telefone: '', curso: '', setor: '', funcoes: [], admin: false }

export default function AdminPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [usuarios,     setUsuarios]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [busca,        setBusca]        = useState('')
  const [filtroStatus, setFiltroStatus] = useState('ativos')
  const [editando,     setEditando]     = useState(null)
  const [showNovo,     setShowNovo]     = useState(false)
  const [formNovo,     setFormNovo]     = useState(FORM_VAZIO)
  const [toast,        setToast]        = useState(null)
  const [salvando,     setSalvando]     = useState(false)

  useEffect(() => {
    if (user && !user.admin) navigate('/dashboard', { replace: true })
  }, [user, navigate])

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      setUsuarios(await adminListarUsuarios())
    } catch (e) {
      showToast('erro', 'Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { if (user?.admin) carregar() }, [carregar, user])

  function showToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const filtrados = usuarios.filter(u => {
    const buscaOk = !busca ||
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase())
    const statusOk =
      filtroStatus === 'todos' ? true :
      filtroStatus === 'ativos' ? u.ativo : !u.ativo
    return buscaOk && statusOk
  })

  async function salvarFuncoes() {
    if (!editando) return
    setSalvando(true)
    try {
      await adminAtribuirFuncoes(editando.usuario.id, {
        funcoes: editando.funcoesLocal,
        admin: editando.adminLocal,
      })
      showToast('ok', 'Funções atualizadas com sucesso!')
      setEditando(null)
      carregar()
    } catch (e) {
      showToast('erro', e.message)
    } finally {
      setSalvando(false)
    }
  }

  async function toggleAtivo(u) {
    try {
      if (u.ativo) await adminDesativarUsuario(u.id)
      else         await adminReativarUsuario(u.id)
      showToast('ok', `Usuário ${u.ativo ? 'desativado' : 'reativado'}!`)
      carregar()
    } catch (e) {
      showToast('erro', e.message)
    }
  }

  async function criarNovoUsuario() {
    setSalvando(true)
    try {
      await adminCriarUsuario(formNovo)
      showToast('ok', 'Usuário criado com sucesso!')
      setShowNovo(false)
      setFormNovo(FORM_VAZIO)
      carregar()
    } catch (e) {
      showToast('erro', e.message)
    } finally {
      setSalvando(false)
    }
  }

  const stats = {
    total:  usuarios.length,
    ativos: usuarios.filter(u => u.ativo).length,
    admins: usuarios.filter(u => u.admin).length,
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Painel Admin"
        subtitle="Gestão de usuários e funções do sistema"
        action={
          <PrimaryButton onClick={() => setShowNovo(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Novo Usuário
          </PrimaryButton>
        }
      />

      {/* Stats */}
      <div style={s.statsRow}>
        {[
          { label: 'Total de usuários', value: stats.total,  color: '#2563eb' },
          { label: 'Usuários ativos',   value: stats.ativos, color: '#16a34a' },
          { label: 'Administradores',   value: stats.admins, color: '#dc2626' },
        ].map(st => (
          <div key={st.label} style={s.statCard}>
            <div style={{ fontSize: 26, fontWeight: 700, color: st.color, letterSpacing: '-.04em' }}>{st.value}</div>
            <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 3, fontWeight: 500 }}>{st.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchBar}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            style={s.searchInput}
            placeholder="Buscar usuário..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div style={s.tabsRow}>
          {['ativos', 'inativos', 'todos'].map(opt => (
            <button
              key={opt}
              style={{ ...s.tab, ...(filtroStatus === opt ? s.tabActive : {}) }}
              onClick={() => setFiltroStatus(opt)}
            >
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span>Usuário</span>
          <span>Funções</span>
          <span>Status</span>
          <span>Ações</span>
        </div>
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--gray)', fontSize: 13 }}>
            Carregando...
          </div>
        ) : filtrados.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--gray)', fontSize: 13 }}>
            Nenhum usuário encontrado
          </div>
        ) : filtrados.map(u => (
          <div key={u.id} style={s.tableRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar nome={u.nome} perfil={(u.funcoes?.[0] || '').toLowerCase()} size={34} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy)' }}>{u.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--gray)' }}>{u.email}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {(u.funcoes || []).map(f => {
                const func = TODAS_FUNCOES.find(x => x.valor === f)
                return (
                  <span key={f} style={{ ...s.funcBadge, color: func?.cor || '#64748b', background: func?.cor ? func.cor + '18' : '#f1f5f9' }}>
                    {func?.label || f}
                  </span>
                )
              })}
              {u.admin && <span style={{ ...s.funcBadge, color: '#dc2626', background: '#fef2f2' }}>Admin</span>}
              {(!u.funcoes || u.funcoes.length === 0) && !u.admin && (
                <span style={{ fontSize: 11, color: 'var(--gray)' }}>—</span>
              )}
            </div>
            <div>
              <span style={{
                ...s.funcBadge,
                color:      u.ativo ? '#16a34a' : '#94a3b8',
                background: u.ativo ? '#f0fdf4' : '#f8fafc',
              }}>
                {u.ativo ? '● Ativo' : '○ Inativo'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <OutlineButton onClick={() => setEditando({ usuario: u, funcoesLocal: [...(u.funcoes || [])], adminLocal: u.admin })} style={{ fontSize: 11, padding: '4px 10px' }}>
                Editar
              </OutlineButton>
              <OutlineButton onClick={() => toggleAtivo(u)} style={{ fontSize: 11, padding: '4px 10px', color: u.ativo ? 'var(--red)' : 'var(--green)', borderColor: u.ativo ? 'var(--red-2)' : 'var(--green-2)' }}>
                {u.ativo ? 'Desativar' : 'Reativar'}
              </OutlineButton>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Editar funções */}
      {editando && (
        <Modal onClose={() => setEditando(null)}>
          <div style={s.modalTitle}>Editar funções — {editando.usuario.nome}</div>
          <div style={{ marginBottom: 14 }}>
            {TODAS_FUNCOES.map(f => {
              const checked = editando.funcoesLocal.includes(f.valor)
              return (
                <label key={f.valor} style={s.checkRow}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const novo = checked
                        ? editando.funcoesLocal.filter(x => x !== f.valor)
                        : [...editando.funcoesLocal, f.valor]
                      setEditando({ ...editando, funcoesLocal: novo })
                    }}
                  />
                  <span style={{ fontSize: 13, color: 'var(--navy)' }}>{f.label}</span>
                </label>
              )
            })}
            <label style={{ ...s.checkRow, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--gray-2)' }}>
              <input
                type="checkbox"
                checked={editando.adminLocal}
                onChange={() => setEditando({ ...editando, adminLocal: !editando.adminLocal })}
              />
              <span style={{ fontSize: 13, color: '#dc2626', fontWeight: 600 }}>Administrador do sistema</span>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <OutlineButton onClick={() => setEditando(null)}>Cancelar</OutlineButton>
            <PrimaryButton onClick={salvarFuncoes} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Modal: Novo usuário */}
      {showNovo && (
        <Modal onClose={() => setShowNovo(false)}>
          <div style={s.modalTitle}>Novo Usuário</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            {[
              { key: 'nome',     label: 'Nome completo',  type: 'text'  },
              { key: 'email',    label: 'E-mail',          type: 'email' },
              { key: 'telefone', label: 'Telefone',        type: 'text'  },
              { key: 'curso',    label: 'Curso (aluno)',   type: 'text'  },
              { key: 'setor',    label: 'Setor (staff)',   type: 'text'  },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 4 }}>
                  {f.label}
                </label>
                <input
                  type={f.type}
                  value={formNovo[f.key]}
                  onChange={e => setFormNovo({ ...formNovo, [f.key]: e.target.value })}
                  style={s.input}
                />
              </div>
            ))}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Funções</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {TODAS_FUNCOES.map(f => {
                  const sel = formNovo.funcoes.includes(f.valor)
                  return (
                    <button
                      key={f.valor}
                      type="button"
                      onClick={() => {
                        const novo = sel ? formNovo.funcoes.filter(x => x !== f.valor) : [...formNovo.funcoes, f.valor]
                        setFormNovo({ ...formNovo, funcoes: novo })
                      }}
                      style={{
                        padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        border: `1.5px solid ${sel ? f.cor : '#e2e8f0'}`,
                        background: sel ? f.cor + '18' : 'transparent',
                        color: sel ? f.cor : '#94a3b8', cursor: 'pointer',
                      }}
                    >
                      {f.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <OutlineButton onClick={() => setShowNovo(false)}>Cancelar</OutlineButton>
            <PrimaryButton onClick={criarNovoUsuario} disabled={salvando}>
              {salvando ? 'Criando...' : 'Criar Usuário'}
            </PrimaryButton>
          </div>
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          ...s.toast,
          background: toast.tipo === 'ok' ? '#f0fdf4' : '#fef2f2',
          borderColor: toast.tipo === 'ok' ? '#bbf7d0' : '#fecaca',
          color: toast.tipo === 'ok' ? '#16a34a' : '#dc2626',
        }}>
          {toast.tipo === 'ok' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </PageWrapper>
  )
}

function Modal({ children, onClose }) {
  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={s.modal}>
        <button style={s.closeBtn} onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  )
}

const s = {
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 },
  statCard: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-2)', padding: '14px 18px',
  },
  toolbar: { display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 },
  searchBar: {
    flex: 1, display: 'flex', alignItems: 'center', gap: 8,
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-2)', padding: '8px 12px',
  },
  searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: 13, background: 'transparent' },
  tabsRow: { display: 'flex', gap: 4 },
  tab: {
    padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
    border: '1px solid var(--gray-2)', background: 'var(--white)',
    color: 'var(--gray)', cursor: 'pointer',
  },
  tabActive: { background: 'var(--blue)', color: 'white', borderColor: 'var(--blue)' },
  table: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-2)', overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 100px 180px',
    padding: '9px 16px', background: 'var(--gray-4)',
    borderBottom: '1px solid var(--gray-2)',
    fontSize: 11, fontWeight: 700, color: 'var(--gray)',
    textTransform: 'uppercase', letterSpacing: '.05em',
  },
  tableRow: {
    display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 100px 180px',
    padding: '12px 16px', borderBottom: '1px solid var(--gray-2)',
    alignItems: 'center',
  },
  funcBadge: {
    display: 'inline-flex', alignItems: 'center',
    padding: '2px 8px', borderRadius: 20,
    fontSize: 10, fontWeight: 700,
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(15,23,42,.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 20,
  },
  modal: {
    background: 'var(--white)', borderRadius: 'var(--radius-xl)',
    padding: '28px 28px', width: '100%', maxWidth: 480,
    maxHeight: '85vh', overflowY: 'auto', position: 'relative',
    boxShadow: '0 32px 64px rgba(0,0,0,.25)',
  },
  closeBtn: {
    position: 'absolute', top: 16, right: 16,
    background: 'var(--gray-4)', border: 'none', borderRadius: 8,
    width: 28, height: 28, fontSize: 12, cursor: 'pointer',
    color: 'var(--gray)',
  },
  modalTitle: { fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 18 },
  checkRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '7px 0', cursor: 'pointer',
  },
  input: {
    width: '100%', border: '1.5px solid var(--gray-2)',
    borderRadius: 9, padding: '8px 12px', fontSize: 13,
    outline: 'none', color: 'var(--navy)', background: 'var(--gray-3)',
  },
  toast: {
    position: 'fixed', bottom: 24, right: 24,
    padding: '12px 18px', borderRadius: 10,
    border: '1px solid', fontSize: 13, fontWeight: 600,
    boxShadow: 'var(--shadow-md)', zIndex: 300,
  },
}
