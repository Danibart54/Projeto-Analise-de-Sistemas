import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_BY_PERFIL = {
  ALUNO: [
    { section: 'Principal', items: [
      { path: '/dashboard',      label: 'Dashboard',       icon: IconGrid },
      { path: '/apos',           label: 'Minhas APOs',     icon: IconFile },
      { path: '/apos/nova',      label: 'Nova APO',        icon: IconPlus },
      { path: '/meus-creditos',  label: 'Meus Créditos',   icon: IconStar },
    ]},
  ],
  ORIENTADOR: [
    { section: 'Principal', items: [
      { path: '/dashboard',       label: 'Dashboard',       icon: IconGrid },
      { path: '/apos',            label: 'APOs',            icon: IconFile },
      { path: '/creditos-alunos', label: 'Créditos Alunos', icon: IconStar },
      { path: '/usuarios',        label: 'Meus Alunos',     icon: IconUsers },
    ]},
  ],
  COMISSAO: [
    { section: 'Principal', items: [
      { path: '/dashboard',  label: 'Dashboard',      icon: IconGrid },
      { path: '/apos',       label: 'APOs Pendentes', icon: IconFile },
      { path: '/avaliacoes', label: 'Avaliações',     icon: IconStar },
    ]},
  ],
  COORDENADORIA: [
    { section: 'Principal', items: [
      { path: '/dashboard',       label: 'Dashboard',       icon: IconGrid },
      { path: '/apos',            label: 'APOs Pendentes',  icon: IconFile },
      { path: '/creditos-alunos', label: 'Créditos Alunos', icon: IconStar },
      { path: '/usuarios',        label: 'Usuários',        icon: IconUsers },
    ]},
  ],
  SECRETARIA: [
    { section: 'Principal', items: [
      { path: '/dashboard',       label: 'Dashboard',       icon: IconGrid },
      { path: '/apos',            label: 'APOs',            icon: IconFile },
      { path: '/creditos-alunos', label: 'Créditos Alunos', icon: IconStar },
      { path: '/usuarios',        label: 'Usuários',        icon: IconUsers },
    ]},
  ],
  ADMIN: [
    { section: 'Principal', items: [
      { path: '/dashboard',       label: 'Dashboard',       icon: IconGrid },
      { path: '/apos',            label: 'APOs',            icon: IconFile },
      { path: '/creditos-alunos', label: 'Créditos Alunos', icon: IconStar },
      { path: '/usuarios',        label: 'Usuários',        icon: IconUsers },
    ]},
    { section: 'Sistema', items: [
      { path: '/admin', label: 'Painel Admin', icon: IconSettings, adminOnly: true },
    ]},
  ],
}

// Aliases por variações de nome
NAV_BY_PERFIL.COMISSAO_JULGADORA = NAV_BY_PERFIL.COMISSAO
NAV_BY_PERFIL.COORDENADOR        = NAV_BY_PERFIL.COORDENADORIA
NAV_BY_PERFIL.SECRETARIO         = NAV_BY_PERFIL.SECRETARIA

const PERFIL_COLORS = {
  aluno:         '#7c3aed',
  orientador:    '#8b5cf6',
  comissao:      '#d97706',
  secretaria:    '#2563eb',
  coordenadoria: '#db2777',
  admin:         '#dc2626',
}

const PERFIL_LABELS = {
  aluno:         'Aluno',
  orientador:    'Orientador',
  comissao:      'Comissão Julgadora',
  secretaria:    'Secretaria',
  coordenadoria: 'Coordenação',
  admin:         'Administrador',
}

export default function Layout() {
  const { user, logout, perfilEfetivo, selecionarPerfil } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  function handleLogout() { logout(); navigate('/login') }

  const perfil      = (perfilEfetivo || user?.perfil || 'ALUNO').toUpperCase()
  const perfilKey   = perfil.toLowerCase()
  const avatarColor = user?.admin ? '#dc2626' : (PERFIL_COLORS[perfilKey] || '#64748b')
  const initials    = user?.nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  const navGroups   = (user?.admin ? NAV_BY_PERFIL.ADMIN : NAV_BY_PERFIL[perfil]) || NAV_BY_PERFIL.ALUNO
  const funcoes     = (user?.funcoes || [user?.perfil]).filter(Boolean)

  return (
    <div style={s.layout}>
      {/* ── Sidebar ── */}
      <aside style={s.sidebar}>
        <div style={s.logoArea}>
          <div style={s.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div>
            <div style={s.logoName}>APO PPGCA</div>
            <div style={s.logoSub}>Atividade Programada Obrigatória</div>
          </div>
        </div>

        {/* Troca de perfil se múltiplos */}
        {funcoes.length > 1 && (
          <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,.08)' }}>
            <select
              value={perfil}
              onChange={e => selecionarPerfil(e.target.value)}
              style={{
                width: '100%', fontSize: 11, padding: '4px 8px',
                borderRadius: 6, border: '1px solid rgba(255,255,255,.2)',
                background: 'rgba(255,255,255,.1)', color: 'white', cursor: 'pointer',
              }}
            >
              {funcoes.map(f => (
                <option key={f} value={f.toUpperCase()} style={{ background: '#1e293b' }}>
                  {PERFIL_LABELS[f.toLowerCase()] || f}
                </option>
              ))}
            </select>
          </div>
        )}

        <nav style={s.nav}>
          {navGroups.map(group => (
            <div key={group.section}>
              <div style={s.navSection}>{group.section}</div>
              {group.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    ...s.navItem,
                    ...(isActive ? s.navItemActive : {}),
                  })}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {item.adminOnly && <span style={s.adminBadge}>Admin</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={s.sidebarFooter}>
          <div style={s.userCard}>
            <div style={{ ...s.avatar, background: avatarColor }}>{initials}</div>
            <div style={s.userInfo}>
              <div style={s.userName}>{user?.nome}</div>
              <div style={s.userRole}>
                {user?.admin ? '⚙ Administrador' : (PERFIL_LABELS[perfilKey] || perfilKey)}
              </div>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn} title="Sair">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={s.main}>
        <Outlet />
      </div>
    </div>
  )
}

/* ── Inline icons ──────────────────────────────────────────────────── */
function IconGrid() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
}
function IconFile() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function IconStar() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
}
function IconUsers() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function IconUser() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
}
function IconSettings() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>
}
function IconPlus() {
  return <svg style={ico} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}

const ico = { width: 16, height: 16, flexShrink: 0 }

/* ── Styles ────────────────────────────────────────────────────────── */
const s = {
  layout: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--gray-4)',
  },
  sidebar: {
    width: 'var(--sidebar-w)',
    minHeight: '100vh',
    background: 'var(--navy)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100,
  },
  logoArea: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '20px 18px 16px',
    borderBottom: '1px solid rgba(255,255,255,.08)',
  },
  logoIcon: {
    width: 34, height: 34,
    background: 'var(--blue)',
    borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  logoName: { color: 'white', fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' },
  logoSub:  { color: 'rgba(255,255,255,.3)', fontSize: 10, marginTop: 1, letterSpacing: '.02em' },

  nav: { flex: 1, padding: '12px 10px', display: 'flex', flexDirection: 'column', gap: 0, overflowY: 'auto' },
  navSection: {
    padding: '10px 10px 4px',
    fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
    textTransform: 'uppercase', color: 'rgba(255,255,255,.2)',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: 8,
    color: 'rgba(255,255,255,.5)',
    fontSize: 13, fontWeight: 500,
    transition: 'all .15s', textDecoration: 'none',
    marginBottom: 2,
  },
  navItemActive: {
    background: 'rgba(37,99,235,.28)',
    color: '#bfdbfe',
  },
  adminBadge: {
    marginLeft: 'auto',
    fontSize: 9, fontWeight: 700,
    background: 'var(--red)', color: 'white',
    padding: '2px 6px', borderRadius: 4, letterSpacing: '.05em',
  },

  sidebarFooter: {
    padding: '10px 10px 14px',
    borderTop: '1px solid rgba(255,255,255,.08)',
  },
  userCard: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 8px', borderRadius: 8, cursor: 'default',
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
  },
  userInfo: { flex: 1, minWidth: 0 },
  userName: {
    color: 'white', fontSize: 12, fontWeight: 600,
    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  userRole: { color: 'rgba(255,255,255,.3)', fontSize: 10, marginTop: 1 },
  logoutBtn: {
    width: 28, height: 28, borderRadius: 7,
    background: 'rgba(255,255,255,.06)', border: 'none',
    color: 'rgba(255,255,255,.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'all .15s',
  },

  main: {
    flex: 1,
    marginLeft: 'var(--sidebar-w)',
    display: 'flex', flexDirection: 'column',
    minHeight: '100vh',
  },
}
