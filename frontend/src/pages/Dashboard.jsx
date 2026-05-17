import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listarSolicitacoes, listarSolicitacoesPorAluno } from '../services/api'

const STATUS_CONFIG = {
  EM_PREENCHIMENTO: { label: 'Em preenchimento', color: '#6b7280', bg: '#f3f4f6' },
  ENVIADA_PARA_ANALISE: { label: 'Enviada', color: '#f59e0b', bg: '#fffbeb' },
  EM_AVALIACAO: { label: 'Em avaliação', color: '#3b82f6', bg: '#eff6ff' },
  APROVADA: { label: 'Aprovada', color: '#10b981', bg: '#f0fdf4' },
  REPROVADA: { label: 'Reprovada', color: '#ef4444', bg: '#fef2f2' },
  CONCLUIDA: { label: 'Concluída', color: '#8b5cf6', bg: '#f5f3ff' },
  CANCELADA: { label: 'Cancelada', color: '#6b7280', bg: '#f3f4f6' },
}

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={{ ...styles.statValue, color }}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = user.perfil === 'aluno'
          ? await listarSolicitacoesPorAluno(user.id)
          : await listarSolicitacoes()
        setSolicitacoes(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const counts = solicitacoes.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  const recentes = [...solicitacoes].slice(0, 5)

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Olá, {user.nome.split(' ')[0]}! 👋</h1>
          <p style={styles.pageSubtitle}>
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {user.perfil === 'aluno' && (
          <button onClick={() => navigate('/solicitacoes/nova')} style={styles.primaryBtn}>
            + Nova Solicitação
          </button>
        )}
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total" value={solicitacoes.length} color="#3b82f6" icon="📋" />
        <StatCard label="Em avaliação" value={counts['EM_AVALIACAO'] || 0} color="#f59e0b" icon="🔍" />
        <StatCard label="Aprovadas" value={counts['APROVADA'] || 0} color="#10b981" icon="✅" />
        <StatCard label="Reprovadas" value={counts['REPROVADA'] || 0} color="#ef4444" icon="❌" />
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Solicitações recentes</h2>
          <button onClick={() => navigate('/solicitacoes')} style={styles.linkBtn}>
            Ver todas →
          </button>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Carregando...</div>
        ) : recentes.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <p>Nenhuma solicitação encontrada</p>
            {user.perfil === 'aluno' && (
              <button onClick={() => navigate('/solicitacoes/nova')} style={{ ...styles.primaryBtn, marginTop: 16 }}>
                Criar primeira solicitação
              </button>
            )}
          </div>
        ) : (
          <div style={styles.list}>
            {recentes.map(s => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG['EM_PREENCHIMENTO']
              return (
                <div key={s.id} style={styles.listItem} onClick={() => navigate(`/solicitacoes/${s.id}`)}>
                  <div style={styles.listItemLeft}>
                    <div style={styles.listItemTitle}>{s.titulo || `Solicitação #${s.id}`}</div>
                    <div style={styles.listItemMeta}>
                      {s.nomeAluno && <span>👤 {s.nomeAluno}</span>}
                      {s.dataEnvio && (
                        <span>📅 {new Date(s.dataEnvio).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                  </div>
                  <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4, textTransform: 'capitalize' },
  primaryBtn: {
    background: '#1e40af', color: 'white', border: 'none',
    borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  statCard: {
    background: 'white', borderRadius: 12, padding: '20px 24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center'
  },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 6 },
  section: { background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 600, color: '#111827' },
  linkBtn: { background: 'none', border: 'none', color: '#1e40af', fontSize: 14, cursor: 'pointer', fontWeight: 500 },
  emptyState: { textAlign: 'center', padding: '48px 0', color: '#6b7280', fontSize: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 1 },
  listItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 16px', borderRadius: 8, cursor: 'pointer',
    transition: 'background 0.15s',
    border: '1px solid #f3f4f6', marginBottom: 4
  },
  listItemLeft: { flex: 1, minWidth: 0 },
  listItemTitle: { fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 },
  listItemMeta: { display: 'flex', gap: 16, fontSize: 12, color: '#6b7280' },
  statusBadge: {
    fontSize: 12, fontWeight: 600, padding: '4px 10px',
    borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0, marginLeft: 12
  }
}
