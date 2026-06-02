import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import ProfileSelectionPage from './pages/ProfileSelectionPage'
import Dashboard from './pages/Dashboard.jsx'
import AposPage from './pages/AposPage.jsx'
import NovaApoPage from './pages/NovaApoPage.jsx'
import ApoDetailPage from './pages/ApoDetailPage.jsx'
import AvaliacaoFluxoPage from './pages/AvaliacaoFluxoPage.jsx'
import CreditosAlunoPage from './pages/CreditosAlunoPage.jsx'
import AlunosCreditosPage from './pages/AlunosCreditosPage.jsx'
import AvaliacaoPage from './pages/AvaliacaoPage.jsx'
import UsuariosPage from './pages/UsuariosPage.jsx'
import AdminPage from './pages/AdminPage.jsx'

function RotaProtegida({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function RotaPerfilSelecionado({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  const funcoes = user.funcoes || [user.perfil]
  const precisaSelecionar = funcoes.length > 1 && !user.perfilAtivo
  if (precisaSelecionar) return <Navigate to="/selecionar-perfil" replace />
  return children
}

function RotaAdminOuCoordenador({ children }) {
  const { user, perfilEfetivo } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.admin || perfilEfetivo === 'COORDENADORIA' || perfilEfetivo === 'COORDENADOR') return children
  return <AcessoNegado />
}

function AcessoNegado() {
  return (
    <div style={{ textAlign: 'center', padding: 80, color: '#6b7280' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>Acesso negado</div>
      <div style={{ fontSize: 14 }}>Você não tem permissão para acessar esta área.</div>
    </div>
  )
}

export default function App() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      <Route path="/selecionar-perfil" element={
        <RotaProtegida><ProfileSelectionPage /></RotaProtegida>
      } />

      <Route path="/" element={
        <RotaPerfilSelecionado><RotaProtegida><Layout /></RotaProtegida></RotaPerfilSelecionado>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"    element={<Dashboard />} />

        {/* APOs — novo fluxo */}
        <Route path="apos"             element={<AposPage />} />
        <Route path="apos/nova"        element={<NovaApoPage />} />
        <Route path="apos/:id"         element={<ApoDetailPage />} />
        <Route path="apos/:id/avaliar" element={<AvaliacaoFluxoPage />} />

        {/* Créditos */}
        <Route path="meus-creditos"    element={<CreditosAlunoPage />} />
        <Route path="creditos-alunos"  element={<AlunosCreditosPage />} />

        {/* Aliases legados */}
        <Route path="solicitacoes"               element={<AposPage />} />
        <Route path="solicitacoes/nova"          element={<NovaApoPage />} />
        <Route path="solicitacoes/:id"           element={<ApoDetailPage />} />
        <Route path="solicitacoes/:id/aprovacao" element={<AvaliacaoFluxoPage />} />
        <Route path="avaliacoes"                 element={<AvaliacaoPage />} />
        <Route path="avaliacoes/:id"             element={<AvaliacaoPage />} />

        <Route path="usuarios" element={
          <RotaAdminOuCoordenador><UsuariosPage /></RotaAdminOuCoordenador>
        } />
        <Route path="admin" element={<AdminPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
