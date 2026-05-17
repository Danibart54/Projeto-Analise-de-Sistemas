import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { buscarSolicitacao, registrarAvaliacao } from '../services/api'

export default function AvaliacaoPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sol, setSol] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({ nota: 7, decisao: 'EM_AVALIACAO', justificativa: '' })

  useEffect(() => {
    buscarSolicitacao(id)
      .then(setSol)
      .catch(e => setMsg('Erro: ' + e.message))
      .finally(() => setLoading(false))
  }, [id])

  function set(field, value) { setForm(f => ({ ...f, [field]: value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.justificativa.trim()) { setMsg('Justificativa obrigatória'); return }
    setSubmitting(true)
    try {
      await registrarAvaliacao(id, {
        nota: parseFloat(form.nota),
        decisao: form.decisao,
        justificativa: form.justificativa
        // V-05: avaliadorId removido — backend usa userId do JWT
      })
      navigate(`/solicitacoes/${id}`)
    } catch (err) {
      setMsg('❌ ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div style={s.loading}>Carregando...</div>

  const notaColor = form.nota >= 7 ? '#10b981' : form.nota >= 5 ? '#f59e0b' : '#ef4444'

  const OPCOES = [
    { value: 'APROVADA',    label: '✅ Aprovar',  color: '#10b981', bg: '#f0fdf4' },
    { value: 'EM_AVALIACAO',label: '⏸ Pendente', color: '#f59e0b', bg: '#fffbeb' },
    { value: 'REPROVADA',   label: '❌ Reprovar', color: '#ef4444', bg: '#fef2f2' },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={s.breadcrumb}>
        <span onClick={() => navigate('/solicitacoes')} style={s.link}>Solicitações</span>
        <span>/</span>
        <span onClick={() => navigate(`/solicitacoes/${id}`)} style={s.link}>#{id}</span>
        <span>/</span>
        <span>Avaliação</span>
      </div>

      <h1 style={s.pageTitle}>Registrar Avaliação</h1>

      {sol && (
        <div style={s.solBox}>
          <div style={s.solTitle}>{sol.titulo}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>👤 {sol.nomeAluno}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>
            Status atual: <strong>{sol.status}</strong>
          </div>
        </div>
      )}

      {msg && <div style={s.erro}>{msg}</div>}

      <form onSubmit={handleSubmit}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Nota</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <input type="range" min={0} max={10} step={0.5}
              value={form.nota} onChange={e => set('nota', e.target.value)}
              style={{ flex: 1, accentColor: notaColor }} />
            <div style={{ ...s.notaBig, color: notaColor, border: `2px solid ${notaColor}` }}>
              {parseFloat(form.nota).toFixed(1)}
            </div>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#9ca3af', marginTop:8 }}>
            <span>0 — Reprovado</span><span>5 — Regular</span><span>10 — Excelente</span>
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Decisão</h2>
          <div style={s.decisaoGrid}>
            {OPCOES.map(opt => (
              <div key={opt.value} onClick={() => set('decisao', opt.value)}
                style={{ ...s.decisaoOpt,
                  background: form.decisao === opt.value ? opt.bg : '#f9fafb',
                  border: `2px solid ${form.decisao === opt.value ? opt.color : '#e5e7eb'}`,
                  color: form.decisao === opt.value ? opt.color : '#6b7280' }}>
                {opt.label}
              </div>
            ))}
          </div>
        </div>

        <div style={s.card}>
          <h2 style={s.cardTitle}>Justificativa *</h2>
          <textarea value={form.justificativa} onChange={e => set('justificativa', e.target.value)}
            placeholder="Descreva os critérios avaliados, pontos positivos e negativos..."
            style={s.textarea} required />
          <div style={{ fontSize:12, color:'#9ca3af', textAlign:'right', marginTop:4 }}>
            {form.justificativa.length} caracteres
          </div>
        </div>

        <div style={s.actions}>
          <button type="button" onClick={() => navigate(-1)} style={s.cancelBtn}>Cancelar</button>
          <button type="submit" disabled={submitting} style={s.submitBtn}>
            {submitting ? 'Salvando...' : '💾 Registrar avaliação'}
          </button>
        </div>
      </form>
    </div>
  )
}

const s = {
  loading: { textAlign:'center', padding:64, color:'#6b7280' },
  breadcrumb: { display:'flex', gap:8, alignItems:'center', fontSize:13, color:'#9ca3af', marginBottom:16 },
  link: { color:'#1e40af', cursor:'pointer' },
  pageTitle: { fontSize:24, fontWeight:700, color:'#111827', marginBottom:20 },
  solBox: { background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:10, padding:'14px 18px', marginBottom:20 },
  solTitle: { fontSize:15, fontWeight:600, color:'#1e40af', marginBottom:4 },
  erro: { background:'#fef2f2', border:'1px solid #fecaca', color:'#dc2626', borderRadius:8, padding:'12px 16px', fontSize:13, marginBottom:20 },
  card: { background:'white', borderRadius:12, padding:24, marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize:15, fontWeight:600, color:'#111827', marginBottom:16 },
  notaBig: { width:60, height:60, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:700, flexShrink:0 },
  decisaoGrid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 },
  decisaoOpt: { padding:'12px 10px', borderRadius:8, cursor:'pointer', textAlign:'center', fontWeight:600, fontSize:13, transition:'all 0.15s' },
  textarea: { width:'100%', minHeight:140, border:'1px solid #d1d5db', borderRadius:8, padding:'12px 14px', fontSize:14, resize:'vertical', fontFamily:'inherit', outline:'none' },
  actions: { display:'flex', gap:12, justifyContent:'flex-end' },
  cancelBtn: { background:'white', color:'#374151', border:'1px solid #d1d5db', borderRadius:8, padding:'10px 20px', fontSize:14, cursor:'pointer', fontWeight:500 },
  submitBtn: { background:'#1e40af', color:'white', border:'none', borderRadius:8, padding:'10px 24px', fontSize:14, fontWeight:600, cursor:'pointer' }
}
