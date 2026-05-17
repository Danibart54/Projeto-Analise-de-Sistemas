import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { useToast } from './hooks/useToast';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Solicitacoes } from './pages/Solicitacoes';
import { NovaSolicitacao } from './pages/NovaSolicitacao';
import { Avaliacoes } from './pages/Avaliacoes';
import { Usuarios } from './pages/Usuarios';
import { Notificacoes } from './pages/Notificacoes';
import { Etapas } from './pages/Etapas';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/Toast';
import './App.css';

export default function App() {
  const { user, login, logout } = useAuth();
  const { toasts, addToast } = useToast();
  const [page, setPage] = useState('dashboard');

  if (!user) return (
    <>
      <Login onLogin={login} />
      <ToastContainer toasts={toasts} />
    </>
  );

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard user={user} onNavigate={setPage} />;
      case 'minhas-solicitacoes': return <Solicitacoes user={user} onToast={addToast} minhaSolicitacao />;
      case 'solicitacoes': return <Solicitacoes user={user} onToast={addToast} />;
      case 'nova-solicitacao': return <NovaSolicitacao user={user} onToast={addToast} onNavigate={setPage} />;
      case 'avaliacoes': return <Avaliacoes user={user} onToast={addToast} />;
      case 'usuarios': return <Usuarios onToast={addToast} />;
      case 'notificacoes': return <Notificacoes user={user} onToast={addToast} />;
      case 'etapas': return <Etapas onToast={addToast} />;
      default: return <Dashboard user={user} onNavigate={setPage} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar user={user} currentPage={page} onNavigate={setPage} onLogout={logout} />
      <main className="app-main">
        <div className="app-content">
          {renderPage()}
        </div>
      </main>
      <ToastContainer toasts={toasts} />
    </div>
  );
}
