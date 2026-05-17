import React from 'react';
import './Sidebar.css';

const navItems = {
  ALUNO: [
    { key: 'dashboard', label: 'Dashboard', icon: '◈' },
    { key: 'minhas-solicitacoes', label: 'Minhas Solicitações', icon: '◉' },
    { key: 'nova-solicitacao', label: 'Nova Solicitação', icon: '+' },
    { key: 'notificacoes', label: 'Notificações', icon: '◎' },
  ],
  ORIENTADOR: [
    { key: 'dashboard', label: 'Dashboard', icon: '◈' },
    { key: 'solicitacoes', label: 'Solicitações', icon: '◉' },
    { key: 'avaliacoes', label: 'Avaliações', icon: '◆' },
    { key: 'notificacoes', label: 'Notificações', icon: '◎' },
  ],
  COMISSAO: [
    { key: 'dashboard', label: 'Dashboard', icon: '◈' },
    { key: 'solicitacoes', label: 'Solicitações', icon: '◉' },
    { key: 'avaliacoes', label: 'Avaliações', icon: '◆' },
    { key: 'usuarios', label: 'Usuários', icon: '◑' },
    { key: 'etapas', label: 'Etapas', icon: '▣' },
  ],
};

export function Sidebar({ user, currentPage, onNavigate, onLogout }) {
  const items = navItems[user?.perfil] || navItems.ALUNO;

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">EF</span>
        <span className="logo-text">ExtensFlow</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.nome?.charAt(0)?.toUpperCase()}</div>
        <div className="user-info">
          <span className="user-name">{user?.nome}</span>
          <span className="user-role">{user?.perfil}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {items.map(item => (
          <button
            key={item.key}
            className={`nav-item ${currentPage === item.key ? 'active' : ''}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <button className="sidebar-logout" onClick={onLogout}>
        <span>↩</span> Sair
      </button>
    </aside>
  );
}
