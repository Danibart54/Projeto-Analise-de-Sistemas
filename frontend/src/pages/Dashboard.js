import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

export function Dashboard({ user, onNavigate }) {
  const [stats, setStats] = useState({ total: 0, pendentes: 0, avaliacao: 0, aprovadas: 0 });
  const [recentes, setRecentes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const params = user.perfil === 'ALUNO' ? { alunoId: user.id } :
                     user.perfil === 'ORIENTADOR' ? { orientadorId: user.id } : {};
      const solic = await api.getSolicitacoes(params);
      setRecentes(solic.slice(0, 5));
      setStats({
        total: solic.length,
        pendentes: solic.filter(s => s.status === 'EM_PREENCHIMENTO').length,
        avaliacao: solic.filter(s => s.status === 'EM_AVALIACAO' || s.status === 'ENVIADA_PARA_ANALISE').length,
        aprovadas: solic.filter(s => s.status === 'APROVADA').length,
      });
    } catch {}
    finally { setLoading(false); }
  }

  if (loading) return <div className="loading"><span className="spinner" /> Carregando...</div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bom dia';
    if (h < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="page-title">{greeting()}, {user.nome.split(' ')[0]} 👋</h1>
        <p className="page-subtitle">Aqui está um resumo das suas atividades.</p>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { icon: '◉', value: stats.total, label: 'Total de Solicitações', color: '#8888ff' },
          { icon: '◎', value: stats.pendentes, label: 'Em Preenchimento', color: 'var(--amber)' },
          { icon: '◆', value: stats.avaliacao, label: 'Em Avaliação', color: 'var(--teal)' },
          { icon: '✓', value: stats.aprovadas, label: 'Aprovadas', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ color: s.color }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600 }}>Solicitações Recentes</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate(user.perfil === 'ALUNO' ? 'minhas-solicitacoes' : 'solicitacoes')}>
            Ver todas →
          </button>
        </div>

        {recentes.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>Nenhuma solicitação encontrada.</p>
            {user.perfil === 'ALUNO' && (
              <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }}
                onClick={() => onNavigate('nova-solicitacao')}>
                + Nova Solicitação
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  <th>Aluno</th>
                  <th>Status</th>
                  <th>Pontuação</th>
                </tr>
              </thead>
              <tbody>
                {recentes.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)', fontSize: 12 }}>#{s.id}</td>
                    <td style={{ fontWeight: 500 }}>{s.titulo}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.nomeAluno || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{s.pontuacaoTotal ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
