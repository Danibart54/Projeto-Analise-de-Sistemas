import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = {
  ALUNO: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'Minhas APOs',     icon: '◉' },
    { path: '/apos/nova',       label: 'Nova APO',        icon: '+' },
    { path: '/meus-creditos',   label: 'Meus Créditos',   icon: '★' },
  ],
  ORIENTADOR: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs',            icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Meus Alunos',     icon: '◑' },
  ],
  COMISSAO_JULGADORA: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs Pendentes',  icon: '◉' },
    { path: '/avaliacoes',      label: 'Avaliações',      icon: '◆' },
  ],
  COMISSAO: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs Pendentes',  icon: '◉' },
    { path: '/avaliacoes',      label: 'Avaliações',      icon: '◆' },
  ],
  COORDENADORIA: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs Pendentes',  icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Usuários',        icon: '◑' },
  ],
  COORDENADOR: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs Pendentes',  icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Usuários',        icon: '◑' },
  ],
  SECRETARIA: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs',            icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Usuários',        icon: '◑' },
  ],
  SECRETARIO: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs',            icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Usuários',        icon: '◑' },
  ],
  ADMIN: [
    { path: '/dashboard',       label: 'Dashboard',       icon: '◈' },
    { path: '/apos',            label: 'APOs',            icon: '◉' },
    { path: '/creditos-alunos', label: 'Créditos Alunos', icon: '★' },
    { path: '/usuarios',        label: 'Usuários',        icon: '◑' },
    { path: '/admin',           label: 'Admin',           icon: '⚙' },
  ],
};

const PERFIL_LABEL = {
  ALUNO:              'Aluno',
  ORIENTADOR:         'Orientador',
  COMISSAO_JULGADORA: 'Comissão Julgadora',
  COMISSAO:           'Comissão Julgadora',
  COORDENADORIA:      'Coordenação',
  COORDENADOR:        'Coordenação',
  SECRETARIA:         'Secretaria',
  SECRETARIO:         'Secretaria',
  ADMIN:              'Administrador',
};

export function Sidebar({ onLogout }) {
  const { user, perfilEfetivo, selecionarPerfil } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const perfil = perfilEfetivo || 'ALUNO';
  const items  = NAV_ITEMS[perfil] || NAV_ITEMS.ALUNO;
  const funcoes = (user?.funcoes || [user?.perfil]).filter(Boolean);

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-mark">APO</span>
        <span className="logo-text">PPGCA</span>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.nome?.charAt(0)?.toUpperCase()}</div>
        <div className="user-info">
          <span className="user-name">{user?.nome}</span>
          <span className="user-role">{PERFIL_LABEL[perfil] || perfil}</span>
        </div>
      </div>

      {funcoes.length > 1 && (
        <div style={{ padding: '0 12px 10px' }}>
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
              <option key={f} value={f} style={{ background: '#1e293b' }}>
                {PERFIL_LABEL[f?.toUpperCase()] || f}
              </option>
            ))}
          </select>
        </div>
      )}

      <nav className="sidebar-nav">
        {items.map(item => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/dashboard' && location.pathname.startsWith(item.path + '/'))
          return (
            <button
              key={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <button className="sidebar-logout" onClick={onLogout}>
        <span>↩</span> Sair
      </button>
    </aside>
  );
}
