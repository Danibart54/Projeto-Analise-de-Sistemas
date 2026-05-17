import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function Notificacoes({ user, onToast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNotificacoes(user.id)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function marcar(id) {
    try {
      await api.marcarLida(id);
      setItems(p => p.map(n => n.id === id ? { ...n, enviada: true } : n));
    } catch {}
  }

  const naoLidas = items.filter(n => !n.enviada).length;

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <div>
      <h1 className="page-title">Notificações</h1>
      <p className="page-subtitle">{naoLidas} não lida{naoLidas !== 1 ? 's' : ''}.</p>

      {items.length === 0 ? (
        <div className="empty-state"><div className="icon">🔔</div><p>Nenhuma notificação.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(n => (
            <div key={n.id} className="card" style={{
              opacity: n.enviada ? 0.6 : 1,
              borderLeft: n.enviada ? '3px solid transparent' : '3px solid var(--teal)',
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="chip" style={{ marginBottom: 8 }}>{n.tipo}</span>
                  <p style={{ fontSize: 14, marginTop: 8 }}>{n.mensagem}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    {n.dataEnvio ? new Date(n.dataEnvio).toLocaleString('pt-BR') : ''}
                  </p>
                </div>
                {!n.enviada && (
                  <button className="btn btn-ghost btn-sm" onClick={() => marcar(n.id)}>
                    Marcar lida
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
