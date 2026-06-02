import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApos, getAposPorAluno, getSolicitacoes, getSolicitacoesPorAluno } from '../services/api'
import {
  PageWrapper, PageHeader, PrimaryButton, Card, CardHeader,
  Badge, EmptyState, LoadingSpinner, STATUS_CONFIG,
} from '../components/ui'

const STAT_CARDS = [
  { key: 'total',              label: 'Total',         color: '#2563eb', iconBg: '#eff6ff' },
  { key: 'ENVIADA_ORIENTADOR', label: 'No Orientador', color: '#0891b2', iconBg: '#ecfeff' },
  { key: 'ENVIADA_COMISSAO',   label: 'Na Comissão',   color: '#d97706', iconBg: '#fffbeb' },
  { key: 'LANCADA_SISTEMA',    label: 'Aprovadas',     color: '#16a34a', iconBg: '#f0fdf4' },
]

export default function Dashboard() {
  const { user, perfilEfetivo } = useAuth()
  const navigate = useNavigate()
  const [apos,    setApos]    = useState([])
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState('')

  const perfil = (perfilEfetivo || user?.perfil || '').toUpperCase()

  useEffect(() => {
    async function load() {
      setErro('')
      try {
        let data
        if (perfil === 'ALUNO') {
          data = await getAposPorAluno(user.id).catch(() => getSolicitacoesPorAluno(user.id))
        } else {
          data = await getApos().catch(() => getSolicitacoes())
        }
        setApos(Array.isArray(data) ? data : (data?.content ?? []))
      } catch (e) {
        setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, perfil])

  const counts = apos.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1
    return acc
  }, {})
  counts.total = apos.length

  const firstName = user.nome.split(' ')[0]
  const dateLabel = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <PageWrapper>
      <PageHeader
        title={`Olá, ${firstName}! 👋`}
        subtitle={dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1)}
        action={
          ['ALUNO','ORIENTADOR'].includes(perfil) && (
            <PrimaryButton onClick={() => navigate('/apos/nova')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova APO
            </PrimaryButton>
          )
        }
      />

      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 16 }}>
          ⚠️ {erro}
        </div>
      )}

      <div style={s.statsGrid}>
        {STAT_CARDS.map(sc => (
          <StatCard key={sc.key} label={sc.label} value={counts[sc.key] || 0}
            color={sc.color} iconBg={sc.iconBg} />
        ))}
      </div>

      <div style={s.twoCol}>
        <Card>
          <CardHeader
            title="APOs recentes"
            action={<span style={s.cardLink} onClick={() => navigate('/apos')}>Ver todas →</span>}
          />
          {loading ? (
            <LoadingSpinner />
          ) : apos.length === 0 ? (
            <EmptyState
              icon="📋"
              message="Nenhuma APO ainda"
              action={
                ['ALUNO','ORIENTADOR'].includes(perfil) && (
                  <PrimaryButton onClick={() => navigate('/apos/nova')} style={{ fontSize: 12 }}>
                    Criar primeira APO
                  </PrimaryButton>
                )
              }
            />
          ) : (
            <div>
              {apos.slice(0, 5).map(apo => (
                <ApoRow key={apo.id} apo={apo} onClick={() => navigate(`/apos/${apo.id}`)} />
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Resumo por status" />
          <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(STATUS_CONFIG)
              .filter(([key]) => (counts[key] || 0) > 0)
              .slice(0, 8)
              .map(([key, cfg]) => {
                const count = counts[key] || 0
                const pct = apos.length ? Math.round((count / apos.length) * 100) : 0
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 500 }}>{cfg.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color }}>{count}</span>
                    </div>
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: 3, background: cfg.color, transition: 'width .4s ease' }} />
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>
      </div>
    </PageWrapper>
  )
}

function StatCard({ label, value, color, iconBg }) {
  return (
    <div style={{ ...s.statCard }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: '14px 14px 0 0' }} />
      <div style={{ ...s.statIcon, background: iconBg }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
        </svg>
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-.04em', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 5, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

function ApoRow({ apo, onClick }) {
  return (
    <div style={s.solRow} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-4)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={s.solTitle}>{apo.titulo || `APO #${apo.id}`}</div>
        <div style={s.solMeta}>
          {apo.nomeAluno && <span>👤 {apo.nomeAluno}</span>}
          {apo.nomeTipoApo && <span>📋 {apo.nomeTipoApo}</span>}
        </div>
      </div>
      <Badge status={apo.status} />
    </div>
  )
}

const s = {
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 },
  statCard:  { background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-2)',
               padding: '16px 20px', position: 'relative', overflow: 'hidden', transition: 'transform .15s, box-shadow .15s' },
  statIcon:  { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  twoCol:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  cardLink:  { fontSize: 12, color: 'var(--blue)', cursor: 'pointer', fontWeight: 600 },
  solRow:    { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px',
               cursor: 'pointer', borderBottom: '1px solid var(--gray-2)', transition: 'background .1s' },
  solTitle:  { fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 3 },
  solMeta:   { display: 'flex', gap: 12, fontSize: 11, color: 'var(--gray)' },
}
