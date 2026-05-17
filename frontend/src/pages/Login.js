import React, { useState } from 'react';
import { api } from '../services/api';
import './Login.css';

export function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await api.login({ email, senha });
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    const demos = {
      aluno: ['aluno@extensflow.com', '123456'],
      orientador: ['orientador@extensflow.com', '123456'],
      comissao: ['comissao@extensflow.com', '123456'],
      secretaria: ['secretaria@extensflow.com', '123456'],
    };
    const [e, s] = demos[role];
    setEmail(e); setSenha(s);
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="bg-orb orb-1" />
        <div className="bg-orb orb-2" />
        <div className="bg-grid" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-mark">EF</div>
          <div>
            <h1 className="login-title">ExtensFlow</h1>
            <p className="login-tagline">Sistema de Avaliação de Projetos de Extensão</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com" required />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)}
              placeholder="••••••" required />
          </div>
          <button className="btn btn-primary login-btn" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Entrando...</> : 'Entrar'}
          </button>
        </form>

        <div className="demo-section">
          <p className="demo-label">Acesso rápido (demo)</p>
          <div className="demo-buttons">
            {['aluno', 'orientador', 'comissao', 'secretaria'].map(r => (
              <button key={r} className="demo-btn" onClick={() => fillDemo(r)}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
