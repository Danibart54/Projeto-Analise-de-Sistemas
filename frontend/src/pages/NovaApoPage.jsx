import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { criarApo, getTiposApo, listarUsuariosV2 } from '../services/api'

export default function NovaApoPage() {
  const { user, perfilEfetivo } = useAuth()
  const navigate = useNavigate()
  const enviando = useRef(false)

  const [loading,   setLoading]   = useState(false)
  const [tiposApo,  setTiposApo]  = useState([])
  const [alunos,    setAlunos]    = useState([])
  const [erros,     setErros]     = useState({})
  const [toast,     setToast]     = useState(null)

  const perfil = (perfilEfetivo || user?.perfil || '').toUpperCase()
  const isOrientador = perfil === 'ORIENTADOR'
  const isAluno = perfil === 'ALUNO'

  const [form, setForm] = useState({
    titulo: '', descricao: '', tipoApoId: '', creditosPrevistos: '',
    dataAtividade: '', alunoId: isAluno ? String(user?.id || '') : '',
    orientadorId: isOrientador ? String(user?.id || '') : '',
    objetivos: '', metodologia: '', resultadosEsperados: '',
  })

  useEffect(() => {
    getTiposApo().then(setTiposApo).catch(() => {})
    if (isOrientador) {
      listarUsuariosV2(true).then(lista => {
        setAlunos(lista.filter(u => u.funcoes?.some(f => f.nome === 'ALUNO') || true))
      }).catch(() => {})
    }
  }, [])

  function set(campo, valor) {
    setForm(f => ({ ...f, [campo]: valor }))
    if (erros[campo]) setErros(e => ({ ...e, [campo]: null }))
    // Preenche créditos automaticamente ao selecionar tipo
    if (campo === 'tipoApoId' && valor) {
      const tipo = tiposApo.find(t => String(t.id) === String(valor))
      if (tipo) setForm(f => ({ ...f, tipoApoId: valor, creditosPrevistos: String(tipo.creditos) }))
    }
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim() || form.titulo.trim().length < 5) e.titulo = 'Título deve ter ao menos 5 caracteres'
    if (!form.tipoApoId) e.tipoApoId = 'Selecione o tipo de APO'
    if (!form.alunoId) e.alunoId = 'Selecione o aluno'
    return e
  }

  function exibirToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (enviando.current) return
    const errosVal = validar()
    if (Object.keys(errosVal).length > 0) { setErros(errosVal); return }

    enviando.current = true
    setLoading(true)

    try {
      const apo = await criarApo({
        titulo:           form.titulo.trim(),
        descricao:        form.descricao.trim() || null,
        alunoId:          Number(form.alunoId),
        tipoApoId:        form.tipoApoId ? Number(form.tipoApoId) : null,
        creditosPrevistos:form.creditosPrevistos ? Number(form.creditosPrevistos) : null,
        dataAtividade:    form.dataAtividade || null,
        orientadorId:     form.orientadorId ? Number(form.orientadorId) : null,
        formulario: {
          titulo:              form.titulo.trim(),
          descricao:           form.descricao.trim() || null,
          objetivos:           form.objetivos.trim() || null,
          metodologia:         form.metodologia.trim() || null,
          resultadosEsperados: form.resultadosEsperados.trim() || null,
        }
      })
      exibirToast('sucesso', '✅ APO criada com sucesso!')
      setTimeout(() => navigate(`/apos/${apo.id}`), 1200)
    } catch (err) {
      exibirToast('erro', err.message || 'Erro ao criar APO.')
    } finally {
      setLoading(false)
      enviando.current = false
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000,
          background: toast.tipo === 'sucesso' ? '#f0fdf4' : '#fef2f2',
          border: `1px solid ${toast.tipo === 'sucesso' ? '#86efac' : '#fecaca'}`,
          color: toast.tipo === 'sucesso' ? '#166534' : '#dc2626',
          borderRadius: 8, padding: '12px 20px', boxShadow: '0 4px 12px rgba(0,0,0,.15)',
          fontSize: 14, fontWeight: 500,
        }}>
          {toast.msg}
        </div>
      )}

      <div style={s.breadcrumb}>
        <span onClick={() => navigate('/apos')} style={s.link}>APOs</span>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#6b7280' }}>Nova APO</span>
      </div>

      <h1 style={s.pageTitle}>Nova APO</h1>

      <form onSubmit={handleSubmit}>
        {/* Tipo de APO */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>📋 Identificação da APO</h2>

          <Campo label="Tipo de APO *" erro={erros.tipoApoId}>
            <select value={form.tipoApoId} onChange={e => set('tipoApoId', e.target.value)}
              style={s.input} disabled={loading}>
              <option value="">Selecione o tipo de APO...</option>
              {tiposApo.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nome} ({t.creditos} crédito{t.creditos !== 1 ? 's' : ''})
                </option>
              ))}
            </select>
          </Campo>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Créditos previstos">
              <input type="number" min="1" max="20" value={form.creditosPrevistos}
                onChange={e => set('creditosPrevistos', e.target.value)}
                placeholder="Automático" style={s.input} disabled={loading} />
            </Campo>
            <Campo label="Data da atividade">
              <input type="date" value={form.dataAtividade}
                onChange={e => set('dataAtividade', e.target.value)}
                style={s.input} disabled={loading} />
            </Campo>
          </div>

          {isOrientador && (
            <Campo label="Aluno *" erro={erros.alunoId}>
              <select value={form.alunoId} onChange={e => set('alunoId', e.target.value)}
                style={s.input} disabled={loading}>
                <option value="">Selecione o aluno...</option>
                {alunos.map(a => (
                  <option key={a.id} value={a.id}>{a.nome} — {a.email}</option>
                ))}
              </select>
            </Campo>
          )}
        </div>

        {/* Detalhes */}
        <div style={s.card}>
          <h2 style={s.sectionTitle}>📝 Detalhes da atividade</h2>

          <Campo label="Título *" erro={erros.titulo}
            hint={`${form.titulo.length}/200 caracteres`}>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="Descreva brevemente a atividade realizada"
              style={s.input} maxLength={200} disabled={loading} />
          </Campo>

          <Campo label="Descrição" hint={`${form.descricao.length}/2000 caracteres`}>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              placeholder="Detalhes adicionais sobre a atividade..."
              style={{ ...s.input, height: 80 }} maxLength={2000} disabled={loading} />
          </Campo>

          <Campo label="Objetivos">
            <textarea value={form.objetivos} onChange={e => set('objetivos', e.target.value)}
              placeholder="Quais foram os objetivos desta atividade?"
              style={{ ...s.input, height: 80 }} disabled={loading} />
          </Campo>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Campo label="Metodologia">
              <textarea value={form.metodologia} onChange={e => set('metodologia', e.target.value)}
                placeholder="Como foi desenvolvida..." style={{ ...s.input, height: 80 }} disabled={loading} />
            </Campo>
            <Campo label="Resultados">
              <textarea value={form.resultadosEsperados} onChange={e => set('resultadosEsperados', e.target.value)}
                placeholder="Resultados obtidos..." style={{ ...s.input, height: 80 }} disabled={loading} />
            </Campo>
          </div>
        </div>

        <div style={s.actions}>
          <button type="button" onClick={() => navigate('/apos')} style={s.cancelBtn} disabled={loading}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }}>
            {loading ? '⏳ Salvando...' : '💾 Criar APO'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Campo({ label, erro, hint, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={s.label}>{label}</label>
      {children}
      {hint && !erro && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>{hint}</div>}
      {erro  && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 3 }}>{erro}</div>}
    </div>
  )
}

const s = {
  breadcrumb:   { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 },
  link:         { color: '#1e40af', cursor: 'pointer' },
  pageTitle:    { fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 24 },
  card:         { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 20 },
  label:        { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input:        { width: '100%', border: '1px solid #d1d5db', borderRadius: 8, padding: '10px 14px',
                  fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  actions:      { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  cancelBtn:    { background: 'white', color: '#374151', border: '1px solid #d1d5db',
                  borderRadius: 8, padding: '10px 20px', fontSize: 14, cursor: 'pointer', fontWeight: 500 },
  submitBtn:    { background: '#1e40af', color: 'white', border: 'none', borderRadius: 8,
                  padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
}
