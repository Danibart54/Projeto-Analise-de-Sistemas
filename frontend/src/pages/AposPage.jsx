import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApos, getAposPorAluno } from '../services/api'
import {
  PageWrapper, PageHeader, PrimaryButton, Badge,
  EmptyState, LoadingSpinner, STATUS_CONFIG,
} from '../components/ui'

const FILTROS = [
  { value: '', label: 'Todas' },
  { value: 'RASCUNHO',                  label: 'Rascunhos' },
  { value: 'ENVIADA_ORIENTADOR',        label: 'No Orientador' },
  { value: 'ENVIADA_COMISSAO',          label: 'Na Comissão' },
  { value: 'ENVIADA_COORDENACAO',       label: 'Na Coordenação' },
  { value: 'ENVIADA_SECRETARIA',        label: 'Na Secretaria' },
  { value: 'AGUARDANDO_ASSINATURA',     label: 'Ag. Assinatura' },
  { value: 'ARQUIVADA',                 label: 'Arquivadas' },
  { value: 'LANCADA_SISTEMA',           label: 'Lançadas' },
  { value: 'FINALIZADA',               label: 'Finalizadas' },
  { value: 'REPROVADA_CANCELADA',       label: 'Canceladas' },
]

export default function AposPage() {
  const { user, perfilEfetivo } = useAuth()
  const navigate = useNavigate()
  const [apos,    setApos]    = useState([])
  const [loading, setLoading] = useState(true)
  const [erro,    setErro]    = useState('')
  const [filtro,  setFiltro]  = useState('')
  const [busca,   setBusca]   = useState('')

  const perfil = perfilEfetivo || user?.perfil || ''

  useEffect(() => { load() }, [filtro])

  async function load() {
    setLoading(true); setErro('')
    try {
      const isAluno = perfil.toUpperCase() === 'ALUNO'
      const data = isAluno
        ? await getAposPorAluno(user.id)
        : filtro ? await getApos({ status: filtro }) : await getApos()
      setApos(data)
    } catch (e) {
      setErro('Não foi possível carregar as APOs.')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const filtradas = apos.filter(a =>
    !busca ||
    a.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
    a.nomeAluno?.toLowerCase().includes(busca.toLowerCase()) ||
    a.nomeTipoApo?.toLowerCase().includes(busca.toLowerCase())
  )

  function countByStatus(status) {
    return apos.filter(a => !status || a.status === status).length
  }

  const podeNovaApo = ['ALUNO','ORIENTADOR'].includes(perfil.toUpperCase())

  return (
    <PageWrapper>
      <PageHeader
        title="APOs"
        subtitle={`${filtradas.length} APO(s) encontrada(s)`}
        action={podeNovaApo && (
          <PrimaryButton onClick={() => navigate('/apos/nova')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nova APO
          </PrimaryButton>
        )}
      />

      {/* Busca */}
      <div style={s.searchBar}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input style={s.searchInput} placeholder="Buscar por título, aluno ou tipo de APO..."
          value={busca} onChange={e => setBusca(e.target.value)} />
        {busca && <button style={s.clearBtn} onClick={() => setBusca('')}>✕</button>}
      </div>

      {/* Filtros */}
      <div style={s.filterRow}>
        {FILTROS.map(f => (
          <button key={f.value} onClick={() => setFiltro(f.value)} style={{
            ...s.filterTab,
            ...(filtro === f.value ? s.filterTabActive : {}),
          }}>
            {f.label}
            <span style={{ ...s.filterCount, ...(filtro === f.value ? s.filterCountActive : {}) }}>
              {countByStatus(f.value)}
            </span>
          </button>
        ))}
      </div>

      {erro && (
        <div style={s.erroBox}>
          ⚠️ {erro}
          <button onClick={load} style={s.retryBtn}>Tentar novamente</button>
        </div>
      )}

      {/* Tabela */}
      <div style={s.table}>
        <div style={s.tableHeader}>
          <span>APO</span>
          <span>Tipo</span>
          <span>Status</span>
          <span>Créditos</span>
          <span>Responsável</span>
          <span></span>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : filtradas.length === 0 ? (
          <EmptyState
            icon="📋"
            message={busca ? 'Nenhuma APO corresponde à busca' : 'Nenhuma APO encontrada'}
            action={podeNovaApo && !busca && (
              <PrimaryButton onClick={() => navigate('/apos/nova')} style={{ fontSize: 12 }}>
                Criar APO
              </PrimaryButton>
            )}
          />
        ) : (
          filtradas.map(apo => (
            <div key={apo.id} style={s.tableRow}
              onClick={() => navigate(`/apos/${apo.id}`)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-4)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--white)'}>
              <div style={{ minWidth: 0 }}>
                <div style={s.rowTitle}>{apo.titulo || `APO #${apo.id}`}</div>
                <div style={s.rowMeta}>
                  {apo.nomeAluno && <span>👤 {apo.nomeAluno}</span>}
                  <span style={{ color: '#cbd5e1' }}>·</span>
                  <span>#{apo.id}</span>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                {apo.nomeTipoApo || '—'}
              </div>
              <div><Badge status={apo.status} /></div>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                {apo.creditosPrevistos != null ? `${apo.creditosAprovados ?? apo.creditosPrevistos} cr.` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                {apo.responsavelAtual || '—'}
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
  searchBar:      { display: 'flex', alignItems: 'center', gap: 10, background: 'var(--white)',
                    borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-2)',
                    padding: '10px 14px', marginBottom: 12 },
  searchInput:    { flex: 1, border: 'none', outline: 'none', fontSize: 13, color: 'var(--navy)', background: 'transparent' },
  clearBtn:       { background: 'none', border: 'none', color: 'var(--gray)', fontSize: 12, cursor: 'pointer', padding: '0 4px' },
  filterRow:      { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 },
  filterTab:      { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px',
                    borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    border: '1px solid var(--gray-2)', background: 'var(--white)', color: 'var(--gray)',
                    transition: 'all .15s' },
  filterTabActive:{ background: 'var(--blue)', color: 'white', borderColor: 'var(--blue)' },
  filterCount:    { fontSize: 10, fontWeight: 700, background: 'var(--gray-2)', color: 'var(--gray)', borderRadius: 10, padding: '1px 6px' },
  filterCountActive: { background: 'rgba(255,255,255,.25)', color: 'white' },
  erroBox:        { background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                    borderRadius: 10, padding: '12px 16px', fontSize: 13, marginBottom: 14,
                    display: 'flex', alignItems: 'center', gap: 8 },
  retryBtn:       { marginLeft: 'auto', background: 'none', border: '1px solid #fecaca',
                    color: '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' },
  table:          { background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-2)', overflow: 'hidden' },
  tableHeader:    { display: 'grid', gridTemplateColumns: '1fr 160px 150px 80px 100px 30px',
                    padding: '9px 16px', background: 'var(--gray-4)', borderBottom: '1px solid var(--gray-2)',
                    fontSize: 11, fontWeight: 700, color: 'var(--gray)', textTransform: 'uppercase',
                    letterSpacing: '.05em', alignItems: 'center' },
  tableRow:       { display: 'grid', gridTemplateColumns: '1fr 160px 150px 80px 100px 30px',
                    padding: '11px 16px', borderBottom: '1px solid var(--gray-2)', cursor: 'pointer',
                    transition: 'background .1s', background: 'var(--white)', alignItems: 'center' },
  rowTitle:       { fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 3 },
  rowMeta:        { display: 'flex', gap: 8, fontSize: 11, color: 'var(--gray)' },
}
