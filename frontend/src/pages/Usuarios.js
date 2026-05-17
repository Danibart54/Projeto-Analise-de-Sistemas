import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';

export function Usuarios({ onToast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', senha: '', perfil: 'ALUNO', matricula: '', curso: '', areaAtuacao: '', titulacao: '', especialidade: '', instituicao: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try { setUsers(await api.getUsuarios()); }
    catch (e) { onToast(e.message, 'error'); }
    finally { setLoading(false); }
  }

  async function handleSubmit() {
    try {
      await api.cadastrar(form);
      onToast('Usuário cadastrado!');
      setShowModal(false); loadData();
    } catch (e) { onToast(e.message, 'error'); }
  }

  async function desativar(id) {
    if (!window.confirm('Desativar este usuário?')) return;
    try { await api.desativarUsuario(id); onToast('Usuário desativado.'); loadData(); }
    catch (e) { onToast(e.message, 'error'); }
  }

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="loading"><span className="spinner" /></div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
        <div>
          <h1 className="page-title">Usuários</h1>
          <p className="page-subtitle">Gerencie os usuários do sistema.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Novo Usuário</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr><th>Nome</th><th>E-mail</th><th>Perfil</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--navy-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--teal)' }}>
                        {u.nome?.charAt(0)}
                      </div>
                      {u.nome}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span className="chip">{u.tipoUsuario || 'USUARIO'}</span>
                  </td>
                  <td>
                    <span className={`badge ${u.ativo ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    {u.ativo && (
                      <button className="btn btn-danger btn-sm" onClick={() => desativar(u.id)}>Desativar</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="Novo Usuário" onClose={() => setShowModal(false)}
          footer={
            <>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Cadastrar</button>
            </>
          }
        >
          <div className="grid-2">
            <div className="form-group">
              <label>Nome *</label>
              <input value={form.nome} onChange={e => upd('nome', e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="form-group">
              <label>E-mail *</label>
              <input type="email" value={form.email} onChange={e => upd('email', e.target.value)} placeholder="email@dominio.com" />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Senha *</label>
              <input type="password" value={form.senha} onChange={e => upd('senha', e.target.value)} placeholder="Mínimo 6 caracteres" />
            </div>
            <div className="form-group">
              <label>Perfil *</label>
              <select value={form.perfil} onChange={e => upd('perfil', e.target.value)}>
                <option value="ALUNO">Aluno</option>
                <option value="ORIENTADOR">Orientador</option>
                <option value="COMISSAO">Comissão</option>
              </select>
            </div>
          </div>
          {form.perfil === 'ALUNO' && (
            <div className="grid-2">
              <div className="form-group"><label>Matrícula</label><input value={form.matricula} onChange={e => upd('matricula', e.target.value)} /></div>
              <div className="form-group"><label>Curso</label><input value={form.curso} onChange={e => upd('curso', e.target.value)} /></div>
            </div>
          )}
          {form.perfil === 'ORIENTADOR' && (
            <div className="grid-2">
              <div className="form-group"><label>Área de Atuação</label><input value={form.areaAtuacao} onChange={e => upd('areaAtuacao', e.target.value)} /></div>
              <div className="form-group"><label>Titulação</label><input value={form.titulacao} onChange={e => upd('titulacao', e.target.value)} /></div>
            </div>
          )}
          {form.perfil === 'COMISSAO' && (
            <div className="grid-2">
              <div className="form-group"><label>Especialidade</label><input value={form.especialidade} onChange={e => upd('especialidade', e.target.value)} /></div>
              <div className="form-group"><label>Instituição</label><input value={form.instituicao} onChange={e => upd('instituicao', e.target.value)} /></div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
