import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getApo, getSolicitacao, getHistoricoApo, enviarApoOrientador } from '../services/api'
import { Badge, STATUS_CONFIG, ETAPAS_FLUXO } from '../components/ui'

export default function ApoDetailPage() {
  const { id }    = useParams()
  const { user, perfilEfetivo }  = useAuth()
  const navigate  = useNavigate()

  const [apo,       setApo]       = useState(null)
  const [historico, setHistorico] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [enviando,  setEnviando]  = useState(false)
  const [toast,     setToast]     = useState(null)

  const perfil = (perfilEfetivo || user?.perfil || '').toUpperCase()

  const carregar = useCallback(async () => {
    try {
      const [data, hist] = await Promise.all([
        getApo(id).catch(() => getSolicitacao(id)),
        getHistoricoApo(id).catch(() => []),
      ])
      setApo(data)
      setHistorico(hist)
    } catch (e) {
      exibirToast('erro', 'Erro ao carregar APO: ' + e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { carregar() }, [carregar])

  function exibirToast(tipo, msg) {
    setToast({ tipo, msg })
    setTimeout(() => setToast(null), 4500)
  }

  async function handleEnviarOrientador() {
    if (enviando) return
    setEnviando(true)
    try {
      const atualizado = await enviarApoOrientador(id)
      setApo(atualizado)
      exibirToast('sucesso', '📨 APO enviada ao orientador!')
    } catch (err) {
      exibirToast('erro', err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div style={s.loading}>Carregando...</div>
  if (!apo)   return <div style={s.loading}>APO não encontrada.</div>

  const eDono        = apo.alunoId === user?.id
  const podeEnviar   = eDono && (apo.status === 'RASCUNHO' || apo.status === 'DEVOLVIDA_ALUNO' || apo.status === 'EM_PREENCHIMENTO')
  const podeAvaliar  = ['ORIENTADOR','COMISSAO','COMISSAO_JULGADORA','COORDENADORIA','COORDENADOR','SECRETARIA','SECRETARIO','ADMIN'].includes(perfil)

  const etapaAtual = calcularEtapaAtual(apo.status)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
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
        <span onClick={() => navigate('/apos')} style={s.link}>APOs</span>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#6b7280' }}>#{apo.id}</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <h1 style={s.titulo}>{apo.titulo}</h1>
        <Badge status={apo.status} />
      </div>

      {/* ── Stepper de fluxo ── */}
      <div style={s.card}>
        <h2 style={s.sub}>Fluxo da APO</h2>
        <div style={s.stepper}>
          {ETAPAS_FLUXO.map((etapa, idx) => {
            const concluida = idx < etapaAtual
            const atual     = idx === etapaAtual
            const futura    = idx > etapaAtual
            return (
              <div key={etapa.label} style={s.stepperItem}>
                <div style={{
                  ...s.stepCircle,
                  background: concluida ? '#16a34a' : atual ? '#2563eb' : '#f1f5f9',
                  color:      concluida || atual ? 'white' : '#94a3b8',
                  border:     atual ? '2px solid #2563eb' : concluida ? '2px solid #16a34a' : '2px solid #e2e8f0',
                }}>
                  {concluida ? '✓' : idx + 1}
                </div>
                <div style={{
                  fontSize: 10, marginTop: 4, fontWeight: atual ? 700 : 500,
                  color: atual ? '#2563eb' : concluida ? '#16a34a' : '#94a3b8',
                  textAlign: 'center', maxWidth: 70,
                }}>
                  {etapa.short}
                </div>
                {idx < ETAPAS_FLUXO.length - 1 && (
                  <div style={{
                    ...s.stepLine,
                    background: concluida ? '#16a34a' : '#e2e8f0',
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Info da etapa atual */}
        <div style={{ display: 'flex', gap: 20, marginTop: 16 }}>
          {apo.responsavelAtual && (
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Responsável atual</span>
              <span style={s.infoVal}>{apo.responsavelAtual}</span>
            </div>
          )}
          {apo.dataAtualizacao && (
            <div style={s.infoItem}>
              <span style={s.infoLabel}>Última atualização</span>
              <span style={s.infoVal}>{new Date(apo.dataAtualizacao).toLocaleString('pt-BR')}</span>
            </div>
          )}
          {apo.justificativaAtual && (
            <div style={{ ...s.infoItem, flex: 1 }}>
              <span style={s.infoLabel}>Justificativa</span>
              <span style={{ ...s.infoVal, color: '#d97706' }}>{apo.justificativaAtual}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Informações ── */}
      <div style={s.card}>
        <h2 style={s.sub}>Informações da APO</h2>
        {apo.nomeAluno         && <Linha label="Aluno"           valor={apo.nomeAluno} />}
        {apo.nomeOrientador    && <Linha label="Orientador"      valor={apo.nomeOrientador} />}
        {apo.nomeTipoApo       && <Linha label="Tipo de APO"     valor={apo.nomeTipoApo} />}
        {apo.creditosPrevistos && <Linha label="Créditos previstos" valor={`${apo.creditosPrevistos} crédito(s)`} />}
        {apo.creditosAprovados != null && <Linha label="Créditos aprovados" valor={`${apo.creditosAprovados} crédito(s)`} />}
        {apo.descricao         && <Linha label="Descrição"       valor={apo.descricao} />}
        {apo.dataCriacao       && <Linha label="Criada em"       valor={new Date(apo.dataCriacao).toLocaleString('pt-BR')} />}
        {apo.dataAtividade     && <Linha label="Data atividade"  valor={new Date(apo.dataAtividade).toLocaleDateString('pt-BR')} />}
      </div>

      {/* ── Ação do aluno ── */}
      {podeEnviar && (
        <div style={s.card}>
          <h2 style={s.sub}>Enviar para avaliação</h2>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            {apo.status === 'DEVOLVIDA_ALUNO'
              ? 'Sua APO foi devolvida para ajustes. Faça as correções e reenvie ao orientador.'
              : 'Ao enviar, o orientador receberá a APO para avaliação inicial.'}
          </p>
          <button onClick={handleEnviarOrientador} disabled={enviando} style={{
            background: '#2563eb', color: 'white', border: 'none', borderRadius: 8,
            padding: '10px 20px', fontSize: 14, fontWeight: 600,
            cursor: enviando ? 'not-allowed' : 'pointer', opacity: enviando ? 0.7 : 1,
          }}>
            {enviando ? '⏳ Enviando...' : '📨 Enviar ao Orientador'}
          </button>
        </div>
      )}

      {/* ── Botão avaliar (para responsáveis) ── */}
      {podeAvaliar && !apo.status?.includes('FINAL') && !['FINALIZADA','REPROVADA_CANCELADA','LANCADA_SISTEMA'].includes(apo.status) && (
        <div style={{ marginBottom: 20 }}>
          <Link to={`/apos/${id}/avaliar`} style={{
            display: 'inline-block', background: '#16a34a', color: 'white',
            padding: '10px 24px', borderRadius: 8, fontSize: 14, fontWeight: 600,
            textDecoration: 'none',
          }}>
            ⚖️ Ir para avaliação
          </Link>
        </div>
      )}

      {/* ── Histórico ── */}
      {historico.length > 0 && (
        <div style={s.card}>
          <h2 style={s.sub}>Histórico de avaliações</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historico.map((h, i) => (
              <div key={h.id || i} style={s.histItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{h.nomeUsuario}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>
                    {h.data ? new Date(h.data).toLocaleString('pt-BR') : ''}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>
                  <span style={{ color: '#374151', fontWeight: 500 }}>{h.acao}</span>
                  {h.statusAnterior && h.statusNovo && (
                    <span> · {h.statusAnterior} → {h.statusNovo}</span>
                  )}
                </div>
                {h.justificativa && (
                  <div style={{ fontSize: 12, color: '#d97706', marginTop: 4, fontStyle: 'italic' }}>
                    "{h.justificativa}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function calcularEtapaAtual(status) {
  for (let i = 0; i < ETAPAS_FLUXO.length; i++) {
    if (ETAPAS_FLUXO[i].status.includes(status)) return i
  }
  return 0
}

function Linha({ label, valor }) {
  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 10, fontSize: 14 }}>
      <span style={{ color: '#6b7280', minWidth: 140 }}>{label}:</span>
      <span style={{ color: '#111827' }}>{valor}</span>
    </div>
  )
}

const s = {
  loading:    { textAlign: 'center', color: '#6b7280', padding: 60 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 },
  link:       { color: '#1e40af', cursor: 'pointer' },
  titulo:     { fontSize: 22, fontWeight: 700, color: '#111827', margin: 0 },
  card:       { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  sub:        { fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 16, marginTop: 0 },
  stepper:    { display: 'flex', alignItems: 'flex-start', gap: 0, overflowX: 'auto', paddingBottom: 8 },
  stepperItem:{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', flex: 1, minWidth: 60 },
  stepCircle: { width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 },
  stepLine:   { position: 'absolute', top: 15, left: '50%', width: '100%', height: 2, zIndex: 0 },
  infoItem:   { display: 'flex', flexDirection: 'column', gap: 2 },
  infoLabel:  { fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.04em' },
  infoVal:    { fontSize: 13, color: '#374151', fontWeight: 500 },
  histItem:   { padding: '12px 16px', background: '#f9fafb', borderRadius: 8 },
}
