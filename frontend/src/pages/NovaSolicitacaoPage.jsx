import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { criarSolicitacao } from '../services/api'

// Limites espelhando @Size do backend
const MAX = { titulo: 200, descricao: 2000, objetivos: 3000, metodologia: 3000, resultados: 3000 }
const MIN_TITULO = 5

export default function NovaSolicitacaoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [erros, setErros] = useState({})
  const [form, setForm] = useState({
    titulo: '', descricao: '', objetivos: '', metodologia: '', resultadosEsperados: ''
  })

  function set(field, value) {
    const max = MAX[field] || MAX.descricao
    if (value.length > max) return          // bloqueia no limite
    setForm(f => ({ ...f, [field]: value }))
    if (erros[field]) setErros(e => ({ ...e, [field]: null }))
  }

  function validar() {
    const e = {}
    if (!form.titulo.trim() || form.titulo.trim().length < MIN_TITULO)
      e.titulo = `Título deve ter ao menos ${MIN_TITULO} caracteres`
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errosValidacao = validar()
    if (Object.keys(errosValidacao).length > 0) { setErros(errosValidacao); return }

    setLoading(true)
    try {
      // alunoId vem do JWT no backend — enviamos aqui só para satisfazer o DTO,
      // mas o backend valida que principal.id() == req.alunoId()
      const data = await criarSolicitacao({
        titulo:    form.titulo.trim(),
        descricao: form.descricao.trim() || null,
        alunoId:   user.id,        // confirmado contra JWT no backend
        formulario: {
          titulo:             form.titulo.trim(),
          descricao:          form.descricao.trim() || null,
          objetivos:          form.objetivos.trim() || null,
          metodologia:        form.metodologia.trim() || null,
          resultadosEsperados:form.resultadosEsperados.trim() || null,
        }
      })
      navigate(`/solicitacoes/${data.id}`)
    } catch (err) {
      setErros({ geral: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth:720, margin:'0 auto' }}>
      <div style={s.breadcrumb}>
        <span onClick={() => navigate('/solicitacoes')} style={s.link}>Solicitações</span>
        <span style={{ color:'#d1d5db' }}>/</span>
        <span style={{ color:'#6b7280' }}>Nova Solicitação</span>
      </div>

      <h1 style={s.pageTitle}>Nova Solicitação de Extensão</h1>

      <form onSubmit={handleSubmit}>
        <div style={s.card}>
          <h2 style={s.sectionTitle}>📌 Informações básicas</h2>

          <Campo label="Título do projeto *" erro={erros.titulo}
            hint={`${form.titulo.length}/${MAX.titulo} caracteres`}>
            <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
              placeholder="Ex: Projeto de Extensão em Saúde Comunitária"
              style={s.input} required minLength={MIN_TITULO} maxLength={MAX.titulo} />
          </Campo>

          <Campo label="Descrição geral"
            hint={`${form.descricao.length}/${MAX.descricao} caracteres`}>
            <textarea value={form.descricao} onChange={e => set('descricao', e.target.value)}
              placeholder="Descreva brevemente o projeto..."
              style={{ ...s.input, height:80 }} maxLength={MAX.descricao} />
          </Campo>
        </div>

        <div style={s.card}>
          <h2 style={s.sectionTitle}>📝 Formulário do projeto</h2>

          <Campo label="Objetivos"
            hint={`${form.objetivos.length}/${MAX.objetivos} caracteres`}>
            <textarea value={form.objetivos} onChange={e => set('objetivos', e.target.value)}
              placeholder="Quais são os objetivos principais deste projeto?"
              style={{ ...s.input, height:100 }} maxLength={MAX.objetivos} />
          </Campo>

          <Campo label="Metodologia"
            hint={`${form.metodologia.length}/${MAX.metodologia} caracteres`}>
            <textarea value={form.metodologia} onChange={e => set('metodologia', e.target.value)}
              placeholder="Como o projeto será desenvolvido?"
              style={{ ...s.input, height:100 }} maxLength={MAX.metodologia} />
          </Campo>

          <Campo label="Resultados esperados"
            hint={`${form.resultadosEsperados.length}/${MAX.resultados} caracteres`}>
            <textarea value={form.resultadosEsperados}
              onChange={e => set('resultadosEsperados', e.target.value)}
              placeholder="Quais resultados e impactos são esperados?"
              style={{ ...s.input, height:100 }} maxLength={MAX.resultados} />
          </Campo>
        </div>

        {erros.geral && (
          <div style={s.erro} role="alert">{erros.geral}</div>
        )}

        <div style={s.actions}>
          <button type="button" onClick={() => navigate('/solicitacoes')} style={s.cancelBtn}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={s.submitBtn}>
            {loading ? 'Salvando...' : '💾 Salvar e continuar'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Campo({ label, erro, hint, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={s.label}>{label}</label>
      {children}
      {hint && !erro && <div style={{ fontSize:11, color:'#9ca3af', marginTop:3 }}>{hint}</div>}
      {erro  && <div style={{ fontSize:11, color:'#dc2626', marginTop:3 }}>{erro}</div>}
    </div>
  )
}

const s = {
  breadcrumb: { display:'flex', alignItems:'center', gap:8, marginBottom:16, fontSize:13 },
  link:       { color:'#1e40af', cursor:'pointer' },
  pageTitle:  { fontSize:24, fontWeight:700, color:'#111827', marginBottom:24 },
  card:       { background:'white', borderRadius:12, padding:24, marginBottom:20,
                boxShadow:'0 1px 3px rgba(0,0,0,0.08)' },
  sectionTitle:{ fontSize:15, fontWeight:600, color:'#111827', marginBottom:20 },
  label:      { display:'block', fontSize:13, fontWeight:500, color:'#374151', marginBottom:6 },
  input:      { width:'100%', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 14px',
                fontSize:14, outline:'none', resize:'vertical', fontFamily:'inherit',
                boxSizing:'border-box' },
  erro:       { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626',
                borderRadius:8, padding:'12px 16px', fontSize:13, marginBottom:16 },
  actions:    { display:'flex', gap:12, justifyContent:'flex-end' },
  cancelBtn:  { background:'white', color:'#374151', border:'1px solid #d1d5db',
                borderRadius:8, padding:'10px 20px', fontSize:14, cursor:'pointer', fontWeight:500 },
  submitBtn:  { background:'#1e40af', color:'white', border:'none', borderRadius:8,
                padding:'10px 24px', fontSize:14, fontWeight:600, cursor:'pointer' },
}
