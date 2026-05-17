import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import SolicitacoesPage from './pages/SolicitacoesPage'
import NovaSolicitacaoPage from './pages/NovaSolicitacaoPage'
import SolicitacaoDetailPage from './pages/SolicitacaoDetailPage'
import AvaliacaoPage from './pages/AvaliacaoPage'
import UsuariosPage from './pages/UsuariosPage'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="solicitacoes" element={<SolicitacoesPage />} />
            <Route path="solicitacoes/nova" element={<NovaSolicitacaoPage />} />
            <Route path="solicitacoes/:id" element={<SolicitacaoDetailPage />} />
            <Route path="solicitacoes/:id/avaliar" element={<AvaliacaoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
