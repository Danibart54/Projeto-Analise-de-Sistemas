import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getSolicitacao, votarSolicitacao, getAprovacoes } from '../services/api'

const TOTAL_COORDENADORES = 3

export default function AprovacaoPage() {
  const { id }     = useParams()
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const votando    = useRef(false)

  const [solicitacao, setSolicitacao] = useState(null)
  const [votos,       setVotos]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [submetendo,  setSubmetendo]  = useState(false)
  const [toast,       setToast]       = useState(null)

  const carregar = useCallback(async () => {
    try {
      const [sol, vts] = await Promise.all([
        getSolicitacao(id),
        getAprovacoes(id)
      ])
      setSolicitacao(sol)
      setVotos(vts)
    } catch (e) {
      exibirToast('erro', 'Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  function exibirToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 5000)
  }

  const perfil         = user?.perfil?.toUpperCase()
  const eCoordenador   = perfil === 'COORDENADORIA' || user?.admin
  const jaVotei        = votos.some(v => v.coordenadorId === user?.id)
  const totalAprovados    = votos.filter(v => v.voto === 'APROVADO').length
  const totalRecusados    = votos.filter(v => v.voto === 'RECUSADO').length
  const todosVotaram      = votos.length >= TOTAL_COORDENADORES
  const resultadoDefinido = todosVotaram
  const podeVotar = eCoordenador && !jaVotei
    && solicitacao?.status === 'ENVIADA_PARA_ANALISE'

  async function handleVotar(voto) {
    if (votando.current || !podeVotar) return
    votando.current = true
    setSubmetendo(true)
    try {
      await votarSolicitacao(id, voto)
      const msg = voto === 'APROVADO'
        ? '✅ Voto de APROVAÇÃO registrado!'
        : '❌ Voto de RECUSA registrado!'
      exibirToast('sucesso', msg)
      await carregar()
    } catch (err) {
      exibirToast('erro', '❌ ' + err.message)
    } finally {
      setSubmetendo(false)
      votando.current = false
    }
  }

  if (loading) return <div style={s.loading}>Carregando...</div>
  if (!solicitacao) return <div style={s.loading}>Solicitação não encontrada.</div>

  const progAprov = Math.min((totalAprovados / TOTAL_COORDENADORES) * 100, 100)
  const progRecus = Math.min((totalRecusados / TOTAL_COORDENADORES) * 100, 100)

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 1000, maxWidth: 420,
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
        <span style={{ color: '#6b7280' }}>Votação #{id}</span>
      </div>

      <h1 style={s.titulo}>Votação dos Coordenadores</h1>

      {/* Dados da solicitação */}
      <div style={s.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
              📄 {solicitacao.titulo}
            </div>
            {solicitacao.nomeAluno && (
              <div style={{ fontSize: 13, color: '#6b7280' }}>Solicitante: {solicitacao.nomeAluno}</div>
            )}
          </div>
          <StatusBadge status={solicitacao.status} />
        </div>
      </div>

      {/* Placar de votos */}
      <div style={s.card}>
        <h2 style={s.subtitulo}>Placar de votos</h2>

        <div style={s.placar}>
          {/* Aprovações */}
          <div style={s.placarCol}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#16a34a', lineHeight: 1 }}>
              {totalAprovados}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>APROVAÇÕES</div>
            <div style={s.barWrap}>
              <div style={{ ...s.barFill, width: `${progAprov}%`, background: '#16a34a' }} />
            </div>
          </div>

          <div style={{ fontSize: 22, color: '#d1d5db', alignSelf: 'center' }}>vs</div>

          {/* Recusas */}
          <div style={s.placarCol}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#dc2626', lineHeight: 1 }}>
              {totalRecusados}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>RECUSAS</div>
            <div style={s.barWrap}>
              <div style={{ ...s.barFill, width: `${progRecus}%`, background: '#dc2626' }} />
            </div>
          </div>

          {/* Total */}
          <div style={s.placarCol}>
            <div style={{ fontSize: 32, fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>
              {votos.length}/{TOTAL_COORDENADORES}
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontWeight: 600 }}>VOTOS</div>
          </div>
        </div>

        {/* Resultado */}
        {resultadoDefinido ? (
          <div style={{
            marginTop: 16, padding: '12px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            background: totalAprovados > totalRecusados ? '#f0fdf4' : '#fef2f2',
            color:      totalAprovados > totalRecusados ? '#166534' : '#dc2626',
            border:    `1px solid ${totalAprovados > totalRecusados ? '#bbf7d0' : '#fecaca'}`,
          }}>
            {totalAprovados > totalRecusados
              ? `🎉 Aprovado! (${totalAprovados}✅ × ${totalRecusados}❌) — Segue para a comissão julgadora.`
              : `🚫 Recusado! (${totalAprovados}✅ × ${totalRecusados}❌) — Solicitação encerrada.`}
          </div>
        ) : (
          <div style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            {votos.length === 0
              ? 'Nenhum coordenador votou ainda.'
              : `${votos.length}/3 votos registrados. Os 3 votos são obrigatórios para definir o resultado.`}
          </div>
        )}
      </div>

      {/* Botões de voto */}
      {podeVotar && (
        <div style={s.card}>
          <h2 style={s.subtitulo}>Registrar meu voto</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Seu voto é definitivo e não pode ser alterado.
            Os 3 coordenadores precisam votar. Ao final, saldo positivo (mais aprovações que recusas) define a aprovação.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => handleVotar('APROVADO')}
              disabled={submetendo}
              style={{
                flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                background: '#16a34a', color: 'white', fontSize: 15, fontWeight: 700,
                cursor: submetendo ? 'not-allowed' : 'pointer',
                opacity: submetendo ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ✅ Aprovar
            </button>
            <button
              onClick={() => handleVotar('RECUSADO')}
              disabled={submetendo}
              style={{
                flex: 1, padding: '14px', borderRadius: 10, border: 'none',
                background: '#dc2626', color: 'white', fontSize: 15, fontWeight: 700,
                cursor: submetendo ? 'not-allowed' : 'pointer',
                opacity: submetendo ? 0.7 : 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              ❌ Recusar
            </button>
          </div>
        </div>
      )}

      {jaVotei && !resultadoDefinido && (
        <div style={{ ...s.card, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
          ✔ Você já registrou seu voto. Aguardando os demais coordenadores.
        </div>
      )}

      {/* Histórico de votos */}
      <div style={s.card}>
        <h2 style={s.subtitulo}>Histórico de votos</h2>
        {votos.length === 0 ? (
          <div style={{ color: '#9ca3af', fontSize: 14, textAlign: 'center', padding: 20 }}>
            Nenhum voto registrado ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {votos.map((v, i) => (
              <div key={v.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: '#f9fafb', borderRadius: 8,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: v.voto === 'APROVADO' ? '#dcfce7' : '#fef2f2',
                  color: v.voto === 'APROVADO' ? '#16a34a' : '#dc2626',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{v.nomeCoordenador}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {v.dataVoto
                      ? new Date(v.dataVoto).toLocaleString('pt-BR')
                      : v.dataAprovacao
                        ? new Date(v.dataAprovacao).toLocaleString('pt-BR')
                        : '—'}
                  </div>
                </div>
                <span style={{
                  padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  background: v.voto === 'APROVADO' ? '#dcfce7' : '#fef2f2',
                  color:      v.voto === 'APROVADO' ? '#16a34a' : '#dc2626',
                }}>
                  {v.voto === 'APROVADO' ? '✅ Aprovado' : '❌ Recusado'}
                </span>
              </div>
            ))}
            {/* Slots vazios */}
            {Array.from({ length: Math.max(0, TOTAL_COORDENADORES - votos.length) }).map((_, i) => (
              <div key={`slot-${i}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', background: '#f9fafb', borderRadius: 8, opacity: 0.4,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', background: '#f3f4f6',
                  color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 700,
                }}>
                  {votos.length + i + 1}
                </div>
                <div style={{ fontSize: 14, color: '#9ca3af' }}>Aguardando voto...</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const map = {
    APROVADA_FINAL:           { bg: '#f0fdf4', color: '#16a34a', label: '🏆 Aprovada Final' },
    RECUSADA_FINAL:           { bg: '#fef2f2', color: '#dc2626', label: '❌ Recusada Final' },
    APROVADA_COORDENADORES:   { bg: '#f0fdf4', color: '#16a34a', label: '✅ Aprovada Coord.' },
    RECUSADA_COORDENADORES:   { bg: '#fef2f2', color: '#dc2626', label: '❌ Recusada Coord.' },
    ENVIADA_PARA_ANALISE:     { bg: '#fffbeb', color: '#d97706', label: '⏳ Aguardando votos' },
    EM_PREENCHIMENTO:         { bg: '#f3f4f6', color: '#6b7280', label: '📝 Em preenchimento' },
    APROVADA:                 { bg: '#f0fdf4', color: '#16a34a', label: '✅ Aprovada' },
    REPROVADA:                { bg: '#fef2f2', color: '#dc2626', label: '❌ Reprovada' },
    CANCELADA:                { bg: '#f3f4f6', color: '#6b7280', label: '🚫 Cancelada' },
  }
  const { bg, color, label } = map[status] || { bg: '#f3f4f6', color: '#6b7280', label: status }
  return (
    <span style={{ background: bg, color, fontSize: 12, fontWeight: 600,
      padding: '4px 12px', borderRadius: 20, whiteSpace: 'nowrap' }}>
      {label}
    </span>
  )
}

const s = {
  loading:    { textAlign: 'center', color: '#6b7280', padding: 60 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 },
  link:       { color: '#1e40af', cursor: 'pointer' },
  titulo:     { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 20 },
  card:       { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  subtitulo:  { fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 },
  placar:     { display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'center' },
  placarCol:  { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 },
  barWrap:    { width: '100%', height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginTop: 8 },
  barFill:    { height: '100%', borderRadius: 4, transition: 'width .4s ease' },
}
