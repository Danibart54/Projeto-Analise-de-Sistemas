import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

export function Solicitacoes({ user, onToast, minhaSolicitacao = false }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [avalModal, setAvalModal] = useState(false);
  const [aval, setAval] = useState({ nota: '', decisao: 'APROVADO', justificativa: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const params = minhaSolicitacao ? { alunoId: user.id } :
                     user.perfil === 'ORIENTADOR' ? { orientadorId: user.id } : {};
      setItems(await api.getSolicitacoes(params));
    } catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function enviar(id) {
    try {
      await api.enviarSolicitacao(id);
      onToast('Solicitação enviada para análise!');
      loadData();
    } catch (e) { onToast(e.message, 'error'); }
  }

  async function atualizarStatus(id, status) {
    try {
      await api.atualizarStatus(id, status);
      onToast('Status atualizado!');
      loadData(); setSelected(null);
    } catch (e) { onToast(e.message, 'error'); }
  }

  async function submitAvaliacao() {
    if (!aval.nota || !selected) return;
    try {
      await api.registrarAvaliacao({
        nota: parseFloat(aval.nota),
        decisao: aval.decisao,
        justificativa: aval.justificativa,
        avaliadorId: user.id,
        solicitacaoId: selected.id,
      });
      onToast('Avaliação registrada!');
      setAvalModal(false); loadData();
    } catch (e) { onToast(e.message, 'error'); }
  }

  const filtered = items.filter(s =>
    s.titulo?.toLowerCase().includes(filter.toLowerCase()) ||
    s.nomeAluno?.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) return <div className="loading"><span className="spinner" /> Carregando...</div>;

  return (
    <div>
      <h1 className="page-title">{minhaSolicitacao ? 'Minhas Solicitações' : 'Solicitações'}</h1>
      <p className="page-subtitle">Gerencie e acompanhe as solicitações de projetos de extensão.</p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <input
          type="text" placeholder="🔍  Buscar por título ou aluno..."
          value={filter} onChange={e => setFilter(e.target.value)}
          style={{ flex: 1, padding: '10px 14px', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14 }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📋</div>
          <p>Nenhuma solicitação encontrada.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Título</th>
                  {!minhaSolicitacao && <th>Aluno</th>}
                  <th>Orientador</th>
                  <th>Status</th>
                  <th>Pontuação</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'var(--mono)', color: 'var(--text-muted)', fontSize: 12 }}>#{s.id}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{s.titulo}</div>
                      {s.descricao && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.descricao.slice(0, 60)}{s.descricao.length > 60 ? '...' : ''}</div>}
                    </td>
                    {!minhaSolicitacao && <td style={{ color: 'var(--text-muted)' }}>{s.nomeAluno || '—'}</td>}
                    <td style={{ color: 'var(--text-muted)' }}>{s.nomeOrientador || '—'}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontFamily: 'var(--mono)', fontSize: 13 }}>
                      {s.pontuacaoTotal != null ? s.pontuacaoTotal.toFixed(1) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {s.status === 'EM_PREENCHIMENTO' && user.perfil === 'ALUNO' && (
                          <button className="btn btn-primary btn-sm" onClick={() => enviar(s.id)}>Enviar</button>
                        )}
                        {(user.perfil === 'ORIENTADOR' || user.perfil === 'COMISSAO') &&
                          s.status !== 'EM_PREENCHIMENTO' && (
                          <button className="btn btn-outline btn-sm" onClick={() => { setSelected(s); setAvalModal(true); }}>
                            Avaliar
                          </button>
                        )}
                        {user.perfil === 'COMISSAO' && (
                          <>
                            <button className="btn btn-ghost btn-sm" onClick={() => atualizarStatus(s.id, 'APROVADA')}>✓</button>
                            <button className="btn btn-danger btn-sm" onClick={() => atualizarStatus(s.id, 'REPROVADA')}>✗</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {avalModal && selected && (
        <Modal
          title={`Avaliar: ${selected.titulo}`}
          onClose={() => setAvalModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setAvalModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={submitAvaliacao}>Registrar Avaliação</button>
            </>
          }
        >
          <div className="grid-2">
            <div className="form-group">
              <label>Nota (0–10)</label>
              <input type="number" min={0} max={10} step={0.1}
                value={aval.nota} onChange={e => setAval(p => ({ ...p, nota: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Decisão</label>
              <select value={aval.decisao} onChange={e => setAval(p => ({ ...p, decisao: e.target.value }))}>
                <option value="APROVADO">Aprovado</option>
                <option value="REPROVADO">Reprovado</option>
                <option value="REVISAO">Revisão</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Justificativa</label>
            <textarea value={aval.justificativa} onChange={e => setAval(p => ({ ...p, justificativa: e.target.value }))}
              placeholder="Descreva os motivos da decisão..." />
          </div>
        </Modal>
      )}
    </div>
  );
}
