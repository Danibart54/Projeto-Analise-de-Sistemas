import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCreditosAlunos } from '../services/api'
import { PageWrapper, PageHeader } from '../components/ui'

export default function AlunosCreditosPage() {
  const navigate = useNavigate()
  const [alunos,    setAlunos]    = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtro,    setFiltro]    = useState('') // '' | 'completos' | 'pendentes'
  const [tipoFiltro,setTipoFiltro]= useState('') // '' | 'MESTRADO' | 'DOUTORADO'

  useEffect(() => {
    getCreditosAlunos().then(data => { setAlunos(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtrados = alunos.filter(a => {
    if (filtro === 'completos'  && !a.completo)  return false
    if (filtro === 'pendentes'  && a.completo)   return false
    if (tipoFiltro && a.tipoAluno?.toUpperCase() !== tipoFiltro) return false
    return true
  })

  const totalCompletos = alunos.filter(a => a.completo).length
  const totalPendentes = alunos.filter(a => !a.completo).length

  return (
    <PageWrapper>
      <PageHeader title="Créditos dos Alunos" subtitle="Acompanhe o progresso de todos os alunos de pós-graduação" />

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Total de Alunos" value={alunos.length} color="#2563eb" />
        <StatCard label="Créditos Completos" value={totalCompletos} color="#16a34a" />
        <StatCard label="Créditos Pendentes" value={totalPendentes} color="#d97706" />
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { val: '', label: 'Todos' },
          { val: 'completos', label: '✅ Completos' },
          { val: 'pendentes', label: '⏳ Pendentes' },
        ].map(f => (
          <button key={f.val} onClick={() => setFiltro(f.val)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: filtro === f.val ? '#2563eb' : '#e2e8f0',
            background: filtro === f.val ? '#2563eb' : 'white',
            color: filtro === f.val ? 'white' : '#6b7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
        <div style={{ width: 1, background: '#e2e8f0', margin: '0 4px' }} />
        {['', 'MESTRADO', 'DOUTORADO'].map(t => (
          <button key={t} onClick={() => setTipoFiltro(t)} style={{
            padding: '5px 14px', borderRadius: 20, border: '1px solid',
            borderColor: tipoFiltro === t ? '#7c3aed' : '#e2e8f0',
            background: tipoFiltro === t ? '#7c3aed' : 'white',
            color: tipoFiltro === t ? 'white' : '#6b7280',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>
            {t || 'Todos os níveis'}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 80px 100px 140px 80px',
          padding: '9px 16px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9',
          fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em',
        }}>
          <span>Aluno</span>
          <span>Nível</span>
          <span>Matrícula</span>
          <span>Créditos</span>
          <span>Status</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando...</div>
        ) : filtrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            Nenhum aluno encontrado com os filtros selecionados.
          </div>
        ) : (
          filtrados.map(a => {
            const pct = a.creditosNecessarios > 0
              ? Math.min(100, Math.round((a.creditosAprovados / a.creditosNecessarios) * 100))
              : 0
            return (
              <div key={a.id} style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 100px 140px 80px',
                padding: '12px 16px', borderBottom: '1px solid #f9fafb', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{a.nome}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 1 }}>{a.email}</div>
                  {a.orientadorId && <div style={{ fontSize: 11, color: '#94a3b8' }}>Orientador ID: {a.orientadorId}</div>}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                  {a.tipoAluno || '—'}
                </div>
                <div style={{ fontSize: 12, color: '#6b7280', textAlign: 'center' }}>
                  {a.matricula || '—'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: a.completo ? '#16a34a' : '#374151' }}>
                      {a.creditosAprovados}/{a.creditosNecessarios}
                    </span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>({pct}%)</span>
                  </div>
                  <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, borderRadius: 3,
                      background: a.completo ? '#16a34a' : '#2563eb',
                      transition: 'width .4s ease',
                    }} />
                  </div>
                </div>
                <div>
                  {a.completo ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a',
                      background: '#f0fdf4', padding: '3px 8px', borderRadius: 10 }}>
                      Completo
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#d97706',
                      background: '#fffbeb', padding: '3px 8px', borderRadius: 10 }}>
                      Pendente
                    </span>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </PageWrapper>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: '16px 20px',
      boxShadow: '0 1px 3px rgba(0,0,0,.08)', borderTop: `3px solid ${color}` }}>
      <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>{label}</div>
    </div>
  )
}
