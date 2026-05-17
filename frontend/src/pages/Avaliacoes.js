import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Avaliacoes({ user, onToast }) {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAvaliacoes(user.perfil !== 'COMISSAO' ? { avaliadorId: user.id } : {})
      .then(setAvaliacoes)
      .catch(e => onToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Avaliações</h1>
      <p className="page-subtitle">Histórico de avaliações registradas.</p>

      {avaliacoes.length === 0 ? (
        <div className="empty-state"><div className="icon">📊</div><p>Nenhuma avaliação encontrada.</p></div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>#</th><th>Nota</th><th>Decisão</th><th>Avaliador</th><th>Data</th><th>Justificativa</th></tr>
              </thead>
              <tbody>
                {avaliacoes.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)', fontSize: 12 }}>#{a.id}</td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--mono)', fontWeight: 700, fontSize: 18,
                        color: a.nota >= 7 ? 'var(--green)' : a.nota >= 5 ? 'var(--amber)' : 'var(--red)'
                      }}>
                        {a.nota?.toFixed(1)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${a.decisao === 'APROVADO' ? 'badge-approved' : a.decisao === 'REPROVADO' ? 'badge-rejected' : 'badge-pending'}`}>
                        {a.decisao}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{a.avaliador?.nome || '—'}</td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {a.dataRegistro ? new Date(a.dataRegistro).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 200 }}>
                      {a.justificativa?.descricao?.slice(0, 80) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
