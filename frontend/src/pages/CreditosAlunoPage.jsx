import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAposPorAluno, getSolicitacoesPorAluno } from '../services/api'
import { PageWrapper, PageHeader, Badge } from '../components/ui'

const CREDITOS_NECESSARIOS = { MESTRADO: 12, DOUTORADO: 24 }

const STATUS_APROVADOS = [
  'LANCADA_SISTEMA','FINALIZADA','ARQUIVADA','APROVADA_FINAL','APROVADA'
]

export default function CreditosAlunoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [apos,    setApos]    = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fn = user?.id
      ? () => getAposPorAluno(user.id).catch(() => getSolicitacoesPorAluno(user.id))
      : () => Promise.resolve([])
    fn().then(data => { setApos(Array.isArray(data) ? data : []); setLoading(false) })
       .catch(() => setLoading(false))
  }, [user?.id])

  const tipoAluno = 'MESTRADO' // Idealmente vem do user.tipoAluno
  const creditosNecessarios = CREDITOS_NECESSARIOS[tipoAluno] || 12

  const aposAprovadas = apos.filter(a => STATUS_APROVADOS.includes(a.status))
  const creditosTotal = aposAprovadas.reduce((sum, a) => sum + (a.creditosAprovados || a.creditosPrevistos || 0), 0)
  const creditosRestantes = Math.max(0, creditosNecessarios - creditosTotal)
  const percentual = Math.min(100, Math.round((creditosTotal / creditosNecessarios) * 100))
  const completo = creditosTotal >= creditosNecessarios

  return (
    <PageWrapper>
      <PageHeader title="Meus Créditos APO" subtitle="Acompanhe seus créditos acumulados" />

      {/* Resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard label="Créditos Aprovados" value={creditosTotal} color="#16a34a" />
        <StatCard label="Créditos Necessários" value={creditosNecessarios} color="#2563eb" />
        <StatCard label="Créditos Restantes" value={creditosRestantes} color={creditosRestantes === 0 ? '#16a34a' : '#d97706'} />
      </div>

      {/* Barra de progresso */}
      <div style={{ background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>Progresso</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: completo ? '#16a34a' : '#2563eb' }}>
            {creditosTotal}/{creditosNecessarios} créditos ({percentual}%)
          </span>
        </div>
        <div style={{ height: 12, background: '#f1f5f9', borderRadius: 6, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${percentual}%`, borderRadius: 6,
            background: completo ? '#16a34a' : '#2563eb', transition: 'width .5s ease',
          }} />
        </div>
        {completo && (
          <div style={{ marginTop: 12, padding: '10px 16px', background: '#f0fdf4', borderRadius: 8,
            color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            🎉 Parabéns! Você completou todos os créditos necessários!
          </div>
        )}
      </div>

      {/* Lista de APOs aprovadas */}
      <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)' }}>
        <div style={{ padding: '13px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 13, color: '#374151' }}>
          APOs com créditos aprovados ({aposAprovadas.length})
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#6b7280' }}>Carregando...</div>
        ) : aposAprovadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>
            Nenhuma APO aprovada ainda.<br />
            <button onClick={() => navigate('/apos/nova')} style={{ marginTop: 12, background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
              Criar nova APO
            </button>
          </div>
        ) : (
          aposAprovadas.map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
              onClick={() => navigate(`/apos/${a.id}`)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{a.titulo}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.nomeTipoApo || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#16a34a' }}>
                  +{a.creditosAprovados || a.creditosPrevistos || 0} cr.
                </span>
                <Badge status={a.status} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* APOs em andamento */}
      {!loading && apos.filter(a => !STATUS_APROVADOS.includes(a.status) && a.status !== 'REPROVADA_CANCELADA').length > 0 && (
        <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,.08)', marginTop: 16 }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, fontSize: 13, color: '#374151' }}>
            APOs em andamento
          </div>
          {apos.filter(a => !STATUS_APROVADOS.includes(a.status) && a.status !== 'REPROVADA_CANCELADA').map(a => (
            <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px', borderBottom: '1px solid #f9fafb', cursor: 'pointer' }}
              onClick={() => navigate(`/apos/${a.id}`)}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: '#111827' }}>{a.titulo}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{a.nomeTipoApo || '—'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>
                  {a.creditosPrevistos ? `${a.creditosPrevistos} cr. previstos` : '—'}
                </span>
                <Badge status={a.status} />
              </div>
            </div>
          ))}
        </div>
      )}
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
