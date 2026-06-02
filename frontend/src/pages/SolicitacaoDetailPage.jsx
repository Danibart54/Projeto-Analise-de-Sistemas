import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSolicitacao, enviarSolicitacao, getAprovacoes, darAvalFinal } from '../services/api'

export default function SolicitacaoDetailPage() {
  const { id }    = useParams()
  const { user }  = useAuth()
  const navigate  = useNavigate()
  const [sol,        setSol]        = useState(null)
  const [aprovacoes, setAprovacoes] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [enviando,   setEnviando]   = useState(false)
  const [avalando,   setAvalando]   = useState(false)
  const [justif,     setJustif]     = useState('')
  const [toast,      setToast]      = useState(null)

  const carregar = useCallback(async () => {
    try {
      const [data, aprov] = await Promise.all([
        getSolicitacao(id),
        getAprovacoes(id).catch(() => [])
      ])
      setSol(data)
      setAprovacoes(aprov)
    } catch (e) {
      exibirToast('erro', 'Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  function exibirToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleEnviar() {
    if (enviando) return
    setEnviando(true)
    try {
      const atualizado = await enviarSolicitacao(id)
      setSol(atualizado)
      exibirToast('sucesso', '📨 Solicitação enviada para análise!')
    } catch (err) {
      exibirToast('erro', err.message)
    } finally {
      setEnviando(false)
    }
  }

  async function handleAvalFinal(aprovado) {
    if (avalando) return
    setAvalando(true)
    try {
      const atualizado = await darAvalFinal(id, aprovado, justif)
      setSol(atualizado)
      exibirToast('sucesso', aprovado
        ? '🏆 Solicitação APROVADA pela comissão julgadora!'
        : '❌ Solicitação RECUSADA pela comissão julgadora.')
    } catch (err) {
      exibirToast('erro', err.message)
    } finally {
      setAvalando(false)
    }
  }

  if (loading) return <div style={s.loading}>Carregando...</div>
  if (!sol) return <div style={s.loading}>Solicitação não encontrada.</div>

  const perfil          = user?.perfil?.toUpperCase()
  const eDono           = sol.alunoId === user?.id
  const eCoordenador    = perfil === 'COORDENADORIA' || user?.admin
  const eComissao       = perfil === 'COMISSAO' || user?.admin
  const jaVotei         = aprovacoes.some(a => a.coordenadorId === user?.id)

  const podeEnviar      = eDono && sol.status === 'EM_PREENCHIMENTO'
  const podeVotar       = eCoordenador && sol.status === 'ENVIADA_PARA_ANALISE'
  const podeAvalFinal   = eComissao && (sol.status === 'APROVADA_COORDENADORES' || sol.status === 'EM_AVALIACAO')

  const totalAprovados  = aprovacoes.filter(a => a.voto === 'APROVADO').length
  const totalRecusados  = aprovacoes.filter(a => a.voto === 'RECUSADO').length

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
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

      {/* Breadcrumb */}
      <div style={s.breadcrumb}>
        <span onClick={() => navigate('/solicitacoes')} style={s.link}>Solicitações</span>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#6b7280' }}>#{sol.id}</span>
      </div>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <h1 style={s.titulo}>{sol.titulo}</h1>
        <StatusBadge status={sol.status} />
      </div>

      {/* Informações */}
      <div style={s.card}>
        <h2 style={s.sub}>Informações da solicitação</h2>
        <Linha label="Solicitante"   valor={sol.nomeAluno} />
        {sol.descricao    && <Linha label="Descrição"   valor={sol.descricao} />}
        {sol.dataCriacao  && <Linha label="Criada em"   valor={new Date(sol.dataCriacao).toLocaleString('pt-BR')} />}
        {sol.dataEnvio    && <Linha label="Enviada em"  valor={new Date(sol.dataEnvio).toLocaleString('pt-BR')} />}
      </div>

      {/* Etapa 1 — Votação dos coordenadores */}
      {(eCoordenador || aprovacoes.length > 0) && (
        <div style={s.card}>
          <h2 style={s.sub}>
            Etapa 1 — Votação dos coordenadores
            <EtapaTag status={sol.status} />
          </h2>

          {/* Placar compacto */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={s.mini}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{totalAprovados}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>aprovações</span>
            </div>
            <div style={s.mini}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#dc2626' }}>{totalRecusados}</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>recusas</span>
            </div>
            <div style={s.mini}>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#2563eb' }}>{aprovacoes.length}/3</span>
              <span style={{ fontSize: 11, color: '#6b7280' }}>votos</span>
            </div>
          </div>

          {/* Votos */}
          {aprovacoes.map((a, i) => (
            <div key={a.id} style={s.aprovItem}>
              <span style={{
                ...s.aprovNum,
                background: a.voto === 'APROVADO' ? '#dcfce7' : a.voto === 'RECUSADO' ? '#fef2f2' : '#dbeafe',
                color:      a.voto === 'APROVADO' ? '#16a34a' : a.voto === 'RECUSADO' ? '#dc2626' : '#1d4ed8',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13, flex: 1 }}>{a.nomeCoordenador}</span>
              {a.voto && (
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
                  background: a.voto === 'APROVADO' ? '#dcfce7' : '#fef2f2',
                  color:      a.voto === 'APROVADO' ? '#16a34a' : '#dc2626',
                }}>
                  {a.voto === 'APROVADO' ? '✅ Aprovado' : '❌ Recusado'}
                </span>
              )}
            </div>
          ))}

          {/* Botão para página de votação */}
          {podeVotar && (
            <Link to={`/solicitacoes/${id}/aprovacao`} style={{
              display: 'inline-block', marginTop: 16,
              background: jaVotei ? '#f3f4f6' : '#2563eb',
              color: jaVotei ? '#6b7280' : 'white',
              padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
              textDecoration: 'none',
            }}>
              {jaVotei ? '✔ Você já votou — ver detalhes' : '🗳 Ir para votação'}
            </Link>
          )}
        </div>
      )}

      {/* Etapa 2 — Aval final da comissão julgadora */}
      {(podeAvalFinal || ['APROVADA_FINAL', 'RECUSADA_FINAL', 'APROVADA', 'REPROVADA'].includes(sol.status)) && (
        <div style={s.card}>
          <h2 style={s.sub}>
            Etapa 2 — Aval final da comissão julgadora
            <EtapaTag status={sol.status} etapa={2} />
          </h2>

          {podeAvalFinal ? (
            <>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                A solicitação foi aprovada pelos coordenadores. Como membro da comissão julgadora,
                você pode dar o aval final de aprovação ou recusa.
              </p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#475569', display: 'block', marginBottom: 5 }}>
                  Justificativa (opcional)
                </label>
                <textarea
                  value={justif}
                  onChange={e => setJustif(e.target.value)}
                  placeholder="Descreva o motivo da decisão..."
                  style={{
                    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
                    padding: '10px 14px', fontSize: 13, resize: 'vertical',
                    fontFamily: 'inherit', outline: 'none', minHeight: 80,
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => handleAvalFinal(true)} disabled={avalando} style={{
                  flex: 1, padding: '12px', background: '#16a34a', color: 'white',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: avalando ? 'not-allowed' : 'pointer', opacity: avalando ? 0.7 : 1,
                }}>
                  🏆 Aprovar definitivamente
                </button>
                <button onClick={() => handleAvalFinal(false)} disabled={avalando} style={{
                  flex: 1, padding: '12px', background: '#dc2626', color: 'white',
                  border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  cursor: avalando ? 'not-allowed' : 'pointer', opacity: avalando ? 0.7 : 1,
                }}>
                  ❌ Recusar definitivamente
                </button>
              </div>
            </>
          ) : (
            <div style={{
              padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              background: ['APROVADA_FINAL','APROVADA'].includes(sol.status) ? '#f0fdf4' : '#fef2f2',
              color:      ['APROVADA_FINAL','APROVADA'].includes(sol.status) ? '#166534' : '#dc2626',
            }}>
              {['APROVADA_FINAL','APROVADA'].includes(sol.status)
                ? '🏆 Comissão aprovou definitivamente esta solicitação.'
                : '❌ Comissão recusou esta solicitação.'}
            </div>
          )}
        </div>
      )}

      {/* Ações do aluno */}
      {podeEnviar && (
        <div style={s.card}>
          <h2 style={s.sub}>Enviar para análise</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Após o envio, os 3 coordenadores irão votar. Com saldo positivo (mais aprovações que recusas) a solicitação avança para a comissão julgadora.
          </p>
          <button onClick={handleEnviar} disabled={enviando} style={{
            background: '#2563eb', color: 'white', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 14, fontWeight: 600,
            cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
          }}>
            {enviando ? '⏳ Enviando...' : '📨 Enviar para análise'}
          </button>
        </div>
      )}
    </div>
  )
}

function EtapaTag({ status, etapa = 1 }) {
  const etapa1Done = ['APROVADA_COORDENADORES','RECUSADA_COORDENADORES','EM_AVALIACAO',
                      'APROVADA_FINAL','RECUSADA_FINAL','APROVADA','REPROVADA']
  const etapa2Done = ['APROVADA_FINAL','RECUSADA_FINAL','APROVADA','REPROVADA']

  const done = etapa === 1 ? etapa1Done.includes(status) : etapa2Done.includes(status)
  const pending = etapa === 1
    ? status === 'ENVIADA_PARA_ANALISE'
    : (status === 'APROVADA_COORDENADORES' || status === 'EM_AVALIACAO')

  if (!done && !pending) return null
  return (
    <span style={{
      marginLeft: 10, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
      background: done ? (etapa2Done.includes(status) && etapa === 2
        ? (['APROVADA_FINAL','APROVADA'].includes(status) ? '#dcfce7' : '#fef2f2')
        : '#dcfce7')
        : '#fef3c7',
      color: done ? (etapa2Done.includes(status) && etapa === 2
        ? (['APROVADA_FINAL','APROVADA'].includes(status) ? '#16a34a' : '#dc2626')
        : '#16a34a')
        : '#d97706',
    }}>
      {pending ? '⏳ Em andamento' : '✓ Concluída'}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    APROVADA_FINAL:           { bg: '#f0fdf4', color: '#16a34a', label: '🏆 Aprovada Final' },
    RECUSADA_FINAL:           { bg: '#fef2f2', color: '#dc2626', label: '❌ Recusada Final' },
    APROVADA_COORDENADORES:   { bg: '#d1fae5', color: '#065f46', label: '✅ Aprovada pelos Coord.' },
    RECUSADA_COORDENADORES:   { bg: '#fef2f2', color: '#dc2626', label: '❌ Recusada pelos Coord.' },
    EM_PREENCHIMENTO:         { bg: '#f3f4f6', color: '#6b7280', label: '📝 Em preenchimento' },
    ENVIADA_PARA_ANALISE:     { bg: '#fffbeb', color: '#d97706', label: '⏳ Aguardando coordenadores' },
    EM_AVALIACAO:             { bg: '#faf5ff', color: '#7c3aed', label: '🔍 Em avaliação' },
    APROVADA:                 { bg: '#f0fdf4', color: '#16a34a', label: '✅ Aprovada' },
    REPROVADA:                { bg: '#fef2f2', color: '#dc2626', label: '❌ Reprovada' },
    CANCELADA:                { bg: '#f3f4f6', color: '#6b7280', label: '🚫 Cancelada' },
    CONCLUIDA:                { bg: '#f0fdf4', color: '#15803d', label: '🏁 Concluída' },
  }
  const { bg, color, label } = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 600,
      padding: '5px 14px', borderRadius: 20, flexShrink: 0 }}>
      {label}
    </span>
  )
}

function Linha({ label, valor }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 14 }}>
      <span style={{ color: '#6b7280', minWidth: 110 }}>{label}:</span>
      <span style={{ color: '#111827' }}>{valor}</span>
    </div>
  )
}

const s = {
  loading:     { textAlign: 'center', color: '#6b7280', padding: 60 },
  breadcrumb:  { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 },
  link:        { color: '#1e40af', cursor: 'pointer' },
  titulo:      { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  card:        { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20,
                 boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  sub:         { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16, marginTop: 0,
                 display: 'flex', alignItems: 'center' },
  mini:        { display: 'flex', flexDirection: 'column', alignItems: 'center',
                 background: '#f9fafb', borderRadius: 8, padding: '10px 16px', gap: 2 },
  aprovItem:   { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                 borderBottom: '1px solid #f3f4f6' },
  aprovNum:    { width: 22, height: 22, borderRadius: '50%',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 fontSize: 11, fontWeight: 700, flexShrink: 0 },
}
