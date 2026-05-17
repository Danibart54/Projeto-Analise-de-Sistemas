import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function NovaSolicitacao({ user, onToast, onNavigate }) {
  const [form, setForm] = useState({
    titulo: '', descricao: '',
    formTitulo: '', formDescricao: '', formObjetivos: '', formMetodologia: '', formPublicoAlvo: '',
    orientadorId: '',
  });
  const [orientadores, setOrientadores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    api.getUsuarios().then(users => {
      setOrientadores(users.filter(u => u.tipoUsuario === 'ORIENTADOR'));
    }).catch(() => {});
  }, []);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleSubmit() {
    if (!form.titulo) { onToast('Título é obrigatório', 'error'); return; }
    setLoading(true);
    try {
      await api.criarSolicitacao({
        ...form,
        alunoId: user.id,
        orientadorId: form.orientadorId || null,
      });
      onToast('Solicitação criada com sucesso!');
      onNavigate('minhas-solicitacoes');
    } catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className="page-title">Nova Solicitação</h1>
      <p className="page-subtitle">Preencha as informações do seu projeto de extensão.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        {[1, 2].map(s => (
          <div key={s} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            background: step === s ? 'var(--teal)' : 'var(--card)',
            color: step === s ? 'var(--navy)' : 'var(--text-muted)',
            border: '1px solid var(--border)', cursor: 'pointer',
          }} onClick={() => setStep(s)}>
            Etapa {s}: {s === 1 ? 'Dados Gerais' : 'Formulário do Projeto'}
          </div>
        ))}
      </div>

      <div className="card">
        {step === 1 && (
          <>
            <div className="form-group">
              <label>Título do Projeto *</label>
              <input type="text" value={form.titulo} onChange={e => update('titulo', e.target.value)}
                placeholder="Ex: Projeto de Inclusão Digital..." />
            </div>
            <div className="form-group">
              <label>Descrição Resumida</label>
              <textarea value={form.descricao} onChange={e => update('descricao', e.target.value)}
                placeholder="Descreva brevemente o projeto..." />
            </div>
            <div className="form-group">
              <label>Orientador</label>
              <select value={form.orientadorId} onChange={e => update('orientadorId', e.target.value)}>
                <option value="">Selecione um orientador</option>
                {orientadores.map(o => (
                  <option key={o.id} value={o.id}>{o.nome}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Próximo →</button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="form-group">
              <label>Título do Formulário</label>
              <input type="text" value={form.formTitulo} onChange={e => update('formTitulo', e.target.value)}
                placeholder="Título do formulário de projeto" />
            </div>
            <div className="form-group">
              <label>Descrição Completa</label>
              <textarea value={form.formDescricao} onChange={e => update('formDescricao', e.target.value)}
                placeholder="Descrição detalhada do projeto..." />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label>Objetivos</label>
                <textarea value={form.formObjetivos} onChange={e => update('formObjetivos', e.target.value)}
                  placeholder="Objetivos gerais e específicos..." style={{ minHeight: 80 }} />
              </div>
              <div className="form-group">
                <label>Metodologia</label>
                <textarea value={form.formMetodologia} onChange={e => update('formMetodologia', e.target.value)}
                  placeholder="Como o projeto será executado..." style={{ minHeight: 80 }} />
              </div>
            </div>
            <div className="form-group">
              <label>Público-Alvo</label>
              <input type="text" value={form.formPublicoAlvo} onChange={e => update('formPublicoAlvo', e.target.value)}
                placeholder="Quem será beneficiado pelo projeto..." />
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setStep(1)}>← Voltar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner" /> Salvando...</> : '✓ Criar Solicitação'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
