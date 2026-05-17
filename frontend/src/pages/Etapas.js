import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

export function Etapas({ onToast }) {
  const [etapas, setEtapas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: '', peso: '', ordem: '' });

  useEffect(() => {
    api.getEtapas().then(setEtapas).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function criar() {
    try {
      await api.criarEtapa({ nome: form.nome, peso: parseFloat(form.peso) || 1, ordem: parseInt(form.ordem) || 1 });
      onToast('Etapa criada!');
      setShowModal(false);
      api.getEtapas().then(setEtapas);
    } catch (e) { onToast(e.message, 'error'); }
  }

  async function encerrar(id) {
    try {
      await api.encerrarEtapa(id);
      onToast('Etapa encerrada!');
      api.getEtapas().then(setEtapas);
    } catch (e) { onToast(e.message, 'error'); }
  }

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Etapas de Avaliação</h1>
          <p className="page-subtitle">Configure as etapas do processo avaliativo.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Nova Etapa</button>
      </div>

      {etapas.length === 0 ? (
        <div className="empty-state"><div className="icon">▣</div><p>Nenhuma etapa configurada.</p></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {etapas.map(e => (
            <div key={e.id} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', align: 'center', gap: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: 18, color: 'var(--teal)', fontWeight: 700 }}>
                  {e.ordem}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{e.nome}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    Peso: {e.peso} · {e.avaliadores?.length || 0} avaliador(es)
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className={`badge ${e.status === 'ENCERRADA' ? 'badge-done' : 'badge-analysis'}`}>{e.status}</span>
                {e.status !== 'ENCERRADA' && (
                  <button className="btn btn-ghost btn-sm" onClick={() => encerrar(e.id)}>Encerrar</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Nova Etapa" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={criar}>Criar</button>
            </>
          }
        >
          <div className="form-group"><label>Nome *</label><input value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Análise Técnica" /></div>
          <div className="grid-2">
            <div className="form-group"><label>Peso</label><input type="number" value={form.peso} onChange={e => setForm(p => ({ ...p, peso: e.target.value }))} placeholder="1.0" /></div>
            <div className="form-group"><label>Ordem</label><input type="number" value={form.ordem} onChange={e => setForm(p => ({ ...p, ordem: e.target.value }))} placeholder="1" /></div>
          </div>
        </Modal>
      )}
    </div>
  );
}
