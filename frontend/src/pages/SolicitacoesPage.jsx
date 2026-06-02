import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSolicitacoes, getSolicitacoesPorAluno } from '../services/api'
import {
  PageWrapper, PageHeader, PrimaryButton, Badge,
  EmptyState, LoadingSpinner, STATUS_CONFIG,
} from '../components/ui'

const FILTROS = [
  { value: '',                       label: 'Todas' },
  { value: 'EM_PREENCHIMENTO',       label: 'Rascunhos' },
  { value: 'ENVIADA_PARA_ANALISE',   label: 'Aguardando coord.' },
  { value: 'APROVADA_COORDENADORES', label: 'Aprovada coord.' },
  { value: 'RECUSADA_COORDENADORES', label: 'Recusada coord.' },
  { value: 'APROVADA_FINAL',         label: 'Aprovadas final' },
  { value: 'RECUSADA_FINAL',         label: 'Recusadas final' },
  { value: 'CONCLUIDA',              label: 'Concluídas' },
]

export default function SolicitacoesPage() {
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [solicitacoes, setSolicitacoes] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [erro,     setErro]     = useState('')
  const [filtro,   setFiltro]   = useState('')
  const [busca,    setBusca]    = useState('')

  useEffect(() => { load() }, [filtro])

  async function load() {
    setLoading(true)
    setErro('')
    try {
      const data = user.perfil?.toUpperCase() === 'ALUNO'
        ? await getSolicitacoesPorAluno(user.id)
        : filtro ? await getSolicitacoes({ status: filtro }) : await getSolicitacoes()
      setSolicitacoes(data)
    } catch (e) {
      setErro('Não foi possível carregar as solicitações. Verifique se o servidor está rodando.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtradas = solicitacoes.filter(s =>
    !busca ||
    s.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    s.nomeAluno?.toLowerCase().includes(busca.toLowerCase())
  )

  function countByStatus(status) {
    return solicitacoes.filter(s => !status || s.status === status).length
  }

  return (
    <PageWrapper>
      <PageHeader
        title="Solicitações"
        subtitle={`${filtradas.length} solicitação(ões) encontrada(s)`}
        action={
          user.perfil?.toUpperCase() === 'ALUNO' && (
            <PrimaryButton onClick={() => navigate('/solicitacoes/nova')}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Nova Solicitação
            </PrimaryButton>
          )
        }
      />

      {/* Search bar */}
      <div style={s.searchBar}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          style={s.searchInput}
          placeholder="Buscar por título ou aluno..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        {busca && (
          <button style={s.clearBtn} onClick={() => setBusca('')}>✕</button>
        )}
      </div>

      {/* Status filter tabs */}
      <div style={s.filterRow}>
        {FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            style={{
              ...s.filterTab,
              ...(filtro === f.value ? s.filterTabActive : {}),
            }}
          >
            {f.label}
            <span style={{
              ...s.filterCount,
              ...(filtro === f.value ? s.filterCountActive : {}),
            }}>
              {countByStatus(f.value)}
            </span>
          </button>
        ))}
      </div>

      {/* Erro de rede */}
      {erro && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 14,
          display: 'flex', alignItems: 'center', gap: 8 }}>
          ⚠️ {erro}
          <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: '1px solid #fecaca',
            color: '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Table */}
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span style={{ gridColumn: '1 / 2' }}>Projeto</span>
          <span>Status</span>
          <span>Enviada em</span>
          <span>Avaliação</span>
          <span></span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtradas.length === 0 ? (
          <EmptyState
            message={busca ? 'Nenhuma solicitação corresponde à busca' : 'Nenhuma solicitação encontrada'}
            action={
              user.perfil?.toUpperCase() === 'ALUNO' && !busca && (
                <PrimaryButton onClick={() => navigate('/solicitacoes/nova')} style={{ fontSize: 12 }}>
                  Criar solicitação
                </PrimaryButton>
              )
            }
          />
        ) : (
          filtradas.map(sol => (
            <div
              key={sol.id}
              style={s.tableRow}
              onClick={() => navigate(`/solicitacoes/${sol.id}`)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}
            >
              <div style={{ minWidth: 0 }}>
                <div style={s.rowTitle}>{sol.titulo || `Solicitação #${sol.id}`}</div>
                <div style={s.rowMeta}>
                  {sol.nomeAluno && <span>👤 {sol.nomeAluno}</span>}
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span>#{sol.id}</span>
                </div>
              </div>
              <div><Badge status={sol.status} /></div>
              <div style={s.rowDate}>
                {sol.dataEnvio ? new Date(sol.dataEnvio).toLocaleDateString('pt-BR') : '—'}
              </div>
              <div style={s.rowScore}>
                {sol.pontuacaoTotal != null ? (
                  <span style={s.scorePill}>⭐ {sol.pontuacaoTotal.toFixed(1)}</span>
                ) : '—'}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
            </div>
          ))
        )}
      </div>
    </PageWrapper>
  )
}

const s = {
  searchBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-2)', padding: '10px 14px',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1, border: 'none', outline: 'none',
    fontSize: 13, color: 'var(--navy)', background: 'transparent',
  },
  clearBtn: {
    background: 'none', border: 'none',
    color: 'var(--gray)', fontSize: 12, cursor: 'pointer',
    padding: '0 4px',
  },
  filterRow: {
    display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14,
  },
  filterTab: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 20,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: '1px solid var(--gray-2)',
    background: 'var(--white)', color: 'var(--gray)',
    transition: 'all .15s',
  },
  filterTabActive: {
    background: 'var(--blue)', color: 'white', borderColor: 'var(--blue)',
  },
  filterCount: {
    fontSize: 10, fontWeight: 700,
    background: 'var(--gray-2)', color: 'var(--gray)',
    borderRadius: 10, padding: '1px 6px',
  },
  filterCountActive: {
    background: 'rgba(255,255,255,.25)', color: 'white',
  },
  table: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--gray-2)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 130px 100px 80px 30px',
    padding: '9px 16px',
    background: 'var(--gray-4)',
    borderBottom: '1px solid var(--gray-2)',
    fontSize: 11, fontWeight: 700,
    color: 'var(--gray)', textTransform: 'uppercase', letterSpacing: '.05em',
    alignItems: 'center',
  },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 130px 100px 80px 30px',
    padding: '11px 16px',
    borderBottom: '1px solid var(--gray-2)',
    cursor: 'pointer', transition: 'background .1s',
    background: 'var(--white)', alignItems: 'center',
  },
  rowTitle: { fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 3 },
  rowMeta:  { display: 'flex', gap: 8, fontSize: 11, color: 'var(--gray)' },
  rowDate:  { fontSize: 12, color: 'var(--gray)' },
  rowScore: { fontSize: 12 },
  scorePill: {
    display: 'inline-flex', alignItems: 'center',
    background: 'var(--amber-3)', color: 'var(--amber)',
    borderRadius: 6, padding: '2px 7px', fontSize: 11, fontWeight: 700,
  },
}
