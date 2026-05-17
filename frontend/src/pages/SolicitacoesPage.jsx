import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { listarSolicitacoes, listarSolicitacoesPorAluno } from '../services/api'

const STATUS_CONFIG = {
  EM_PREENCHIMENTO: { label: 'Em preenchimento', color: '#6b7280', bg: '#f3f4f6' },
  ENVIADA_PARA_ANALISE: { label: 'Enviada para análise', color: '#f59e0b', bg: '#fffbeb' },
  EM_AVALIACAO: { label: 'Em avaliação', color: '#3b82f6', bg: '#eff6ff' },
  APROVADA: { label: 'Aprovada', color: '#10b981', bg: '#f0fdf4' },
  REPROVADA: { label: 'Reprovada', color: '#ef4444', bg: '#fef2f2' },
  CONCLUIDA: { label: 'Concluída', color: '#8b5cf6', bg: '#f5f3ff' },
  CANCELADA: { label: 'Cancelada', color: '#6b7280', bg: '#f3f4f6' },
}

export default function SolicitacoesPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('')
  const [busca, setBusca] = useState('')

  useEffect(() => { load() }, [filtro])

  async function load() {
    setLoading(true)
    try {
      const data = user.perfil === 'aluno'
        ? await listarSolicitacoesPorAluno(user.id)
        : filtro ? await listarSolicitacoes(filtro) : await listarSolicitacoes()
      setSolicitacoes(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtradas = solicitacoes.filter(s =>
    !busca || s.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    s.nomeAluno?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Solicitações</h1>
          <p style={styles.pageSubtitle}>{filtradas.length} solicitação(ões)</p>
        </div>
        {user.perfil === 'aluno' && (
          <button onClick={() => navigate('/solicitacoes/nova')} style={styles.primaryBtn}>
            + Nova Solicitação
          </button>
        )}
      </div>

      <div style={styles.toolbar}>
        <input
          placeholder="Buscar por título ou aluno..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          style={styles.searchInput}
        />
        {user.perfil !== 'aluno' && (
          <select value={filtro} onChange={e => setFiltro(e.target.value)} style={styles.select}>
            <option value="">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>
        )}
      </div>

      {loading ? (
        <div style={styles.emptyState}>Carregando...</div>
      ) : filtradas.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>Nenhuma solicitação encontrada</p>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtradas.map(s => {
            const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG['EM_PREENCHIMENTO']
            return (
              <div key={s.id} style={styles.card} onClick={() => navigate(`/solicitacoes/${s.id}`)}>
                <div style={styles.cardHeader}>
                  <span style={{ ...styles.badge, color: cfg.color, background: cfg.bg }}>
                    {cfg.label}
                  </span>
                  <span style={styles.cardId}>#{s.id}</span>
                </div>
                <h3 style={styles.cardTitle}>{s.titulo || `Solicitação #${s.id}`}</h3>
                {s.descricao && (
                  <p style={styles.cardDesc}>{s.descricao.substring(0, 100)}{s.descricao.length > 100 ? '...' : ''}</p>
                )}
                <div style={styles.cardFooter}>
                  {s.nomeAluno && <span style={styles.cardMeta}>👤 {s.nomeAluno}</span>}
                  {s.dataEnvio && (
                    <span style={styles.cardMeta}>
                      📅 {new Date(s.dataEnvio).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {s.pontuacaoTotal != null && (
                    <span style={styles.cardMeta}>⭐ {s.pontuacaoTotal.toFixed(1)}</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const styles = {
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  primaryBtn: {
    background: '#1e40af', color: 'white', border: 'none',
    borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer'
  },
  toolbar: { display: 'flex', gap: 12, marginBottom: 24 },
  searchInput: {
    flex: 1, border: '1px solid #d1d5db', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, outline: 'none'
  },
  select: {
    border: '1px solid #d1d5db', borderRadius: 8,
    padding: '10px 14px', fontSize: 14, outline: 'none', background: 'white', cursor: 'pointer'
  },
  emptyState: { textAlign: 'center', padding: '64px 0', color: '#6b7280', fontSize: 14 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: {
    background: 'white', borderRadius: 12, padding: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer',
    transition: 'box-shadow 0.2s, transform 0.2s',
    border: '1px solid #f3f4f6'
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20 },
  cardId: { fontSize: 12, color: '#9ca3af' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8, lineHeight: 1.4 },
  cardDesc: { fontSize: 13, color: '#6b7280', marginBottom: 12, lineHeight: 1.5 },
  cardFooter: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  cardMeta: { fontSize: 12, color: '#9ca3af' }
}
