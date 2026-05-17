import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { path: '/solicitacoes', label: 'Solicitações', icon: '📋' },
  { path: '/usuarios', label: 'Usuários', icon: '👥', roles: ['comissao', 'secretaria'] },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  const perfilColors = {
    aluno: '#10b981',
    orientador: '#8b5cf6',
    comissao: '#f59e0b',
    secretaria: '#3b82f6'
  }

  const perfilLabels = {
    aluno: 'Aluno',
    orientador: 'Orientador',
    comissao: 'Comissão Julgadora',
    secretaria: 'Secretaria'
  }

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="8" fill="white" fillOpacity="0.15"/>
            <path d="M8 20 L20 8 L32 20 L20 32 Z" fill="white" opacity="0.9"/>
            <circle cx="20" cy="20" r="5" fill="#93c5fd"/>
          </svg>
          <span style={styles.sidebarTitle}>ExtensFlow</span>
        </div>

        <nav style={styles.nav}>
          {NAV_ITEMS.filter(item => !item.roles || item.roles.includes(user?.perfil)).map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              style={({ isActive }) => ({
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {})
              })}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={styles.sidebarFooter}>
          <div style={styles.userInfo}>
            <div style={{ ...styles.avatar, background: perfilColors[user?.perfil] }}>
              {user?.nome?.charAt(0)?.toUpperCase()}
            </div>
            <div style={styles.userText}>
              <div style={styles.userName}>{user?.nome}</div>
              <div style={styles.userRole}>{perfilLabels[user?.perfil]}</div>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Sair">
            ⎋
          </button>
        </div>
      </aside>

      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: '#f9fafb' },
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    top: 0, left: 0, bottom: 0,
    zIndex: 100
  },
  sidebarHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)'
  },
  sidebarTitle: { color: 'white', fontWeight: 700, fontSize: 18 },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 8,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.15s',
    textDecoration: 'none'
  },
  navItemActive: {
    background: 'rgba(255,255,255,0.15)',
    color: 'white'
  },
  navIcon: { fontSize: 16 },
  sidebarFooter: {
    padding: '16px 12px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 },
  avatar: {
    width: 34, height: 34, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0
  },
  userText: { minWidth: 0 },
  userName: { color: 'white', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  userRole: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  logoutBtn: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    width: 32, height: 32,
    borderRadius: 6,
    fontSize: 16,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  main: { flex: 1, marginLeft: 240, padding: '32px 32px', minHeight: '100vh' }
}
