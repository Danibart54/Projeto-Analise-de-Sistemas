import { useState, useEffect, useCallback } from 'react'
import { listarUsuariosV2, cadastrarUsuarioV2, atualizarUsuarioV2, desativarUsuarioV2 } from '../services/api'

// Funções disponíveis no sistema
const FUNCOES_DISPONIVEIS = [
  { valor: 'ALUNO',             label: '🎓 Aluno' },
  { valor: 'SECRETARIO',        label: '🗂️ Secretário' },
  { valor: 'COORDENADOR',       label: '👑 Coordenador' },
  { valor: 'ORIENTADOR',        label: '👨‍🏫 Orientador' },
  { valor: 'COMISSAO_JULGADORA',label: '⚖️ Comissão Julgadora' },
]

const FORM_VAZIO = {
  nome: '', email: '', senha: '', telefone: '',
  curso: '', setor: '', funcoes: []
}

export default function UsuariosV2Page() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editando, setEditando] = useState(null)   // usuário sendo editado
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [toast, setToast] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [enviando, setEnviando] = useState(false)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listarUsuariosV2(true)
      setUsuarios(data)
    } catch (e) {
      exibirToast('erro', 'Erro ao carregar usuários: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  function exibirToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4000)
  }

  function setField(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros(e => ({ ...e, [campo]: null }))
  }

  function toggleFuncao(valor) {
    setForm(f => {
      const jatem = f.funcoes.includes(valor)
      return {
        ...f,
        funcoes: jatem
          ? f.funcoes.filter(v => v !== valor)
          : [...f.funcoes, valor]
      }
    })
    if (erros.funcoes) setErros(e => ({ ...e, funcoes: null }))
  }

  function abrirCadastro() {
    setEditando(null)
    setForm(FORM_VAZIO)
    setErros({})
    setShowForm(true)
  }

  function abrirEdicao(usuario) {
    setEditando(usuario)
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      senha: '',  // não preencher senha para edição
      telefone: usuario.telefone || '',
      curso: usuario.curso || '',
      setor: usuario.setor || '',
      funcoes: usuario.funcoes || []
    })
    setErros({})
    setShowForm(true)
  }

  function validar() {
    const e = {}
    if (!form.nome.trim() || form.nome.length < 2) e.nome = 'Nome deve ter ao menos 2 caracteres'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido'
    if (!editando && (!form.senha || form.senha.length < 8)) e.senha = 'Senha deve ter ao menos 8 caracteres'
    if (!form.funcoes || form.funcoes.length === 0) e.funcoes = 'Selecione ao menos uma função'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (enviando) return

    const errosValidacao = validar()
    if (Object.keys(errosValidacao).length > 0) { setErros(errosValidacao); return }

    setEnviando(true)
    try {
      const body = {
        nome:     form.nome.trim(),
        email:    form.email.trim().toLowerCase(),
        telefone: form.telefone.trim() || null,
        curso:    form.curso.trim() || null,
        setor:    form.setor.trim() || null,
        funcoes:  form.funcoes,
        ...(form.senha ? { senha: form.senha } : {})
      }

      if (editando) {
        await atualizarUsuarioV2(editando.id, body)
        exibirToast('sucesso', '✅ Usuário atualizado com sucesso!')
      } else {
        await cadastrarUsuarioV2({ ...body, senha: form.senha })
        exibirToast('sucesso', '✅ Usuário cadastrado com sucesso!')
      }

      setShowForm(false)
      setForm(FORM_VAZIO)
      setEditando(null)
      // Recarrega lista com dados frescos do servidor
      await carregar()
    } catch (err) {
      exibirToast('erro', '❌ ' + err.message)
      setErros({ geral: err.message })
    } finally {
      setEnviando(false)
    }
  }

  async function handleDesativar(usuario) {
    if (!window.confirm(`Desativar o usuário "${usuario.nome}"?`)) return
    try {
      await desativarUsuarioV2(usuario.id)
      exibirToast('sucesso', '✅ Usuário desativado.')
      await carregar()
    } catch (err) {
      exibirToast('erro', '❌ ' + err.message)
    }
  }

  // Filtra por função localmente para resposta imediata
  const usuariosFiltrados = filtroFuncao
    ? usuarios.filter(u => u.funcoes?.includes(filtroFuncao))
    : usuarios

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: toast.tipo === 'sucesso' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.tipo === 'sucesso' ? '#86efac' : '#fecaca'}`,
          color: toast.tipo === 'sucesso' ? '#166534' : '#dc2626',
          borderRadius: 8, padding: '12px 20px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: 14, fontWeight: 500
        }}>
          {toast.msg}
        </div>
      )}

      {/* Cabeçalho */}
      <div style={s.header}>
        <h1 style={s.titulo}>Usuários</h1>
        <button onClick={abrirCadastro} style={s.btnPrimario}>+ Cadastrar usuário</button>
      </div>

      {/* Filtro por função */}
      <div style={s.filtroBar}>
        <label style={{ fontSize: 13, color: '#6b7280', marginRight: 8 }}>Filtrar por função:</label>
        <select value={filtroFuncao} onChange={e => setFiltroFuncao(e.target.value)} style={s.select}>
          <option value="">Todas as funções</option>
          {FUNCOES_DISPONIVEIS.map(f => (
            <option key={f.valor} value={f.valor}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Lista de usuários */}
      {loading ? (
        <div style={s.loading}>Carregando...</div>
      ) : usuariosFiltrados.length === 0 ? (
        <div style={s.vazio}>Nenhum usuário encontrado.</div>
      ) : (
        <div style={s.grid}>
          {usuariosFiltrados.map(u => (
            <div key={u.id} style={s.card}>
              <div style={s.cardHeader}>
                <div>
                  <div style={s.cardNome}>{u.nome}</div>
                  <div style={s.cardEmail}>{u.email}</div>
                  {u.telefone && <div style={s.cardInfo}>📞 {u.telefone}</div>}
                  {u.curso    && <div style={s.cardInfo}>🎓 {u.curso}</div>}
                  {u.setor    && <div style={s.cardInfo}>🏢 {u.setor}</div>}
                </div>
                <div style={s.cardAcoes}>
                  <button onClick={() => abrirEdicao(u)} style={s.btnEditar}>Editar</button>
                  <button onClick={() => handleDesativar(u)} style={s.btnDesativar}>Desativar</button>
                </div>
              </div>

              {/* Badges de funções */}
              <div style={s.funcoesWrap}>
                {(u.funcoes || []).map(f => (
                  <span key={f} style={s.funcaoBadge}>
                    {FUNCOES_DISPONIVEIS.find(fd => fd.valor === f)?.label || f}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de cadastro/edição */}
      {showForm && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={s.modal}>
            <h2 style={s.modalTitulo}>
              {editando ? '✏️ Editar usuário' : '👤 Cadastrar usuário'}
            </h2>

            <form onSubmit={handleSubmit}>
              <Campo label="Nome completo *" erro={erros.nome}>
                <input value={form.nome} onChange={e => setField('nome', e.target.value)}
                  style={s.input} maxLength={150} disabled={enviando} />
              </Campo>

              <Campo label="E-mail *" erro={erros.email}>
                <input type="email" value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  style={s.input} maxLength={254} disabled={enviando} />
              </Campo>

              <Campo label={editando ? 'Nova senha (deixe em branco para manter)' : 'Senha *'}
                erro={erros.senha}>
                <input type="password" value={form.senha}
                  onChange={e => setField('senha', e.target.value)}
                  style={s.input} minLength={8} maxLength={128} disabled={enviando} />
              </Campo>

              <div style={s.row}>
                <Campo label="Telefone" style={{ flex: 1 }}>
                  <input value={form.telefone} onChange={e => setField('telefone', e.target.value)}
                    style={s.input} maxLength={20} disabled={enviando} />
                </Campo>
                <Campo label="Curso" style={{ flex: 1 }}>
                  <input value={form.curso} onChange={e => setField('curso', e.target.value)}
                    style={s.input} maxLength={100} disabled={enviando} />
                </Campo>
              </div>

              <Campo label="Setor">
                <input value={form.setor} onChange={e => setField('setor', e.target.value)}
                  style={s.input} maxLength={100} disabled={enviando} />
              </Campo>

              {/* Seleção de múltiplas funções */}
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Funções * <span style={{ color: '#9ca3af', fontWeight: 400 }}>(selecione uma ou mais)</span></label>
                <div style={s.funcoesGrid}>
                  {FUNCOES_DISPONIVEIS.map(f => {
                    const selecionada = form.funcoes.includes(f.valor)
                    return (
                      <label key={f.valor} style={{
                        ...s.funcaoOpcao,
                        background: selecionada ? '#eff6ff' : 'white',
                        borderColor: selecionada ? '#3b82f6' : '#d1d5db',
                        cursor: enviando ? 'not-allowed' : 'pointer'
                      }}>
                        <input
                          type="checkbox"
                          checked={selecionada}
                          onChange={() => !enviando && toggleFuncao(f.valor)}
                          style={{ marginRight: 8, accentColor: '#3b82f6' }}
                        />
                        {f.label}
                      </label>
                    )
                  })}
                </div>
                {erros.funcoes && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{erros.funcoes}</div>
                )}
              </div>

              {erros.geral && (
                <div style={s.erroGeral}>{erros.geral}</div>
              )}

              <div style={s.modalAcoes}>
                <button type="button" onClick={() => setShowForm(false)}
                  style={s.btnCancelar} disabled={enviando}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...s.btnPrimario, opacity: enviando ? 0.7 : 1 }}
                  disabled={enviando}>
                  {enviando ? '⏳ Salvando...' : (editando ? '💾 Salvar alterações' : '✅ Cadastrar')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function Campo({ label, erro, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={s.label}>{label}</label>
      {children}
      {erro && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>{erro}</div>}
    </div>
  )
}

const s = {
  header:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  titulo:      { fontSize: 24, fontWeight: 700, color: '#111827', margin: 0 },
  filtroBar:   { display: 'flex', alignItems: 'center', marginBottom: 20 },
  select:      { border: '1px solid #d1d5db', borderRadius: 8, padding: '6px 12px', fontSize: 13 },
  loading:     { textAlign: 'center', color: '#6b7280', padding: 40 },
  vazio:       { textAlign: 'center', color: '#6b7280', padding: 40 },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card:        { background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardHeader:  { display: 'flex', justifyContent: 'space-between', marginBottom: 12 },
  cardNome:    { fontWeight: 600, fontSize: 15, color: '#111827' },
  cardEmail:   { fontSize: 13, color: '#6b7280', marginTop: 2 },
  cardInfo:    { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  cardAcoes:   { display: 'flex', flexDirection: 'column', gap: 6 },
  funcoesWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  funcaoBadge: { background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 600,
                 padding: '3px 10px', borderRadius: 20, border: '1px solid #bfdbfe' },
  btnPrimario: { background: '#1e40af', color: 'white', border: 'none', borderRadius: 8,
                 padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnEditar:   { background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db',
                 borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' },
  btnDesativar:{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                 borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200,
                 display: 'flex', alignItems: 'center', justifyContent: 'center' },
  modal:       { background: 'white', borderRadius: 16, padding: 32, width: '100%', maxWidth: 520,
                 maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  modalTitulo: { fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 24, marginTop: 0 },
  modalAcoes:  { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  label:       { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input:       { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '9px 14px',
                 fontSize: 14, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  row:         { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  funcoesGrid: { display: 'flex', flexDirection: 'column', gap: 8 },
  funcaoOpcao: { display: 'flex', alignItems: 'center', padding: '10px 14px', borderRadius: 8,
                 border: '1px solid', fontSize: 13, fontWeight: 500, transition: 'all 0.15s' },
  btnCancelar: { background: 'white', color: '#374151', border: '1px solid #d1d5db',
                 borderRadius: 8, padding: '9px 18px', fontSize: 13, cursor: 'pointer' },
  erroGeral:   { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                 borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12 },
}
