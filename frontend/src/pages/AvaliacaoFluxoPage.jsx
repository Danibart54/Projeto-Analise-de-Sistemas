import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  getApo, getSolicitacao, getTiposApo,
  orientadorAprovar, orientadorDevolver, orientadorAbster, orientadorIniciarAvaliacao,
  comissaoAprovar, comissaoDevolver, comissaoReprovar, comissaoIniciarAvaliacao,
  coordenacaoAprovar, coordenacaoDevolver, coordenacaoReprovar, coordenacaoIniciarAvaliacao,
  secretariaAguardarAssinatura, secretariaAssinar, secretariaArquivar, secretariaLancarSistema,
} from '../services/api'
import { Badge } from '../components/ui'

export default function AvaliacaoFluxoPage() {
  const { id }    = useParams()
  const { user, perfilEfetivo } = useAuth()
  const navigate  = useNavigate()

  const [apo,       setApo]       = useState(null)
  const [tiposApo,  setTiposApo]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [enviando,  setEnviando]  = useState(false)
  const [justif,    setJustif]    = useState('')
  const [novoTipo,  setNovoTipo]  = useState('')
  const [toast,     setToast]     = useState(null)

  const perfil = (perfilEfetivo || user?.perfil || '').toUpperCase()

  const carregar = useCallback(async () => {
    try {
      const [data, tipos] = await Promise.all([
        getApo(id).catch(() => getSolicitacao(id)),
        getTiposApo().catch(() => []),
      ])
      setApo(data)
      setTiposApo(tipos)
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

  async function exec(fn, ...args) {
    if (enviando) return
    setEnviando(true)
    try {
      const atualizado = await fn(...args)
      setApo(atualizado)
      exibirToast('sucesso', '✅ Ação realizada com sucesso!')
      setTimeout(() => navigate(`/apos/${id}`), 1500)
    } catch (err) {
      exibirToast('erro', '❌ ' + err.message)
    } finally {
      setEnviando(false)
    }
  }

  if (loading) return <div style={s.loading}>Carregando...</div>
  if (!apo)   return <div style={s.loading}>APO não encontrada.</div>

  const status = apo.status

  // Determina quais ações estão disponíveis para o perfil e status atual
  const podeOrientador  = perfil === 'ORIENTADOR' && (status === 'ENVIADA_ORIENTADOR' || status === 'EM_AVALIACAO_ORIENTADOR')
  const podeComissao    = (perfil === 'COMISSAO' || perfil === 'COMISSAO_JULGADORA') && (status === 'ENVIADA_COMISSAO' || status === 'EM_AVALIACAO_COMISSAO')
  const podeCoordenacao = (perfil === 'COORDENADORIA' || perfil === 'COORDENADOR') && (status === 'ENVIADA_COORDENACAO' || status === 'EM_AVALIACAO_COORDENACAO' || status === 'ABSTENCAO_ORIENTADOR')
  const podeSecretaria  = (perfil === 'SECRETARIA' || perfil === 'SECRETARIO') && ['APROVADA_COORDENACAO','ENVIADA_SECRETARIA','AGUARDANDO_ASSINATURA','ASSINADA','ARQUIVADA'].includes(status)

  const podeFazerAlgo   = perfil === 'ADMIN' || podeOrientador || podeComissao || podeCoordenacao || podeSecretaria

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

      <div style={s.breadcrumb}>
        <span onClick={() => navigate(`/apos/${id}`)} style={s.link}>APO #{id}</span>
        <span style={{ color: '#d1d5db' }}>/</span>
        <span style={{ color: '#6b7280' }}>Avaliação</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={s.titulo}>Avaliação da APO</h1>
        <Badge status={status} />
      </div>

      {/* Dados da APO */}
      <div style={s.card}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
          📄 {apo.titulo}
        </div>
        {apo.nomeAluno    && <div style={{ fontSize: 13, color: '#6b7280' }}>Aluno: {apo.nomeAluno}</div>}
        {apo.nomeTipoApo  && <div style={{ fontSize: 13, color: '#6b7280' }}>Tipo: {apo.nomeTipoApo} — {apo.creditosPrevistos} crédito(s)</div>}
        {apo.descricao    && <div style={{ fontSize: 13, color: '#374151', marginTop: 8 }}>{apo.descricao}</div>}
      </div>

      {!podeFazerAlgo && (
        <div style={{ ...s.card, background: '#f8fafc', color: '#64748b', fontSize: 13 }}>
          ℹ️ Esta APO está no status <strong>{status}</strong> e não requer ação do seu perfil ({perfil}) no momento.
        </div>
      )}

      {/* ── Orientador ── */}
      {(podeOrientador || perfil === 'ADMIN') && (
        <div style={s.card}>
          <h2 style={s.sub}>Avaliação do Orientador</h2>

          {status === 'ENVIADA_ORIENTADOR' && (
            <button onClick={() => exec(orientadorIniciarAvaliacao, id)} disabled={enviando} style={{ ...s.btnBlue, marginBottom: 16 }}>
              🔍 Iniciar avaliação
            </button>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Justificativa (obrigatória para devolução/abstenção)</label>
            <textarea value={justif} onChange={e => setJustif(e.target.value)}
              placeholder="Descreva o motivo da decisão..."
              style={s.textarea} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => exec(orientadorAprovar, id, justif)} disabled={enviando} style={s.btnGreen}>
              ✅ Aprovar e Encaminhar para Comissão
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(orientadorDevolver, id, justif)
            }} disabled={enviando} style={s.btnAmber}>
              ↩️ Devolver ao Aluno
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(orientadorAbster, id, justif)
            }} disabled={enviando} style={s.btnGray}>
              🚫 Abster-se (vai para Coordenação)
            </button>
          </div>
        </div>
      )}

      {/* ── Comissão Julgadora ── */}
      {(podeComissao || perfil === 'ADMIN') && (
        <div style={s.card}>
          <h2 style={s.sub}>Avaliação da Comissão Julgadora</h2>

          {status === 'ENVIADA_COMISSAO' && (
            <button onClick={() => exec(comissaoIniciarAvaliacao, id)} disabled={enviando} style={{ ...s.btnBlue, marginBottom: 16 }}>
              🔍 Iniciar avaliação
            </button>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Alterar tipo de APO (opcional)</label>
            <select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={s.input}>
              <option value="">Manter tipo atual: {apo.nomeTipoApo}</option>
              {tiposApo.filter(t => t.id !== apo.tipoApoId).map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.creditos} créditos)</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Justificativa</label>
            <textarea value={justif} onChange={e => setJustif(e.target.value)}
              placeholder="Decisão e motivação..." style={s.textarea} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => exec(comissaoAprovar, id, novoTipo || null, justif)} disabled={enviando} style={s.btnGreen}>
              ✅ Aprovar e Encaminhar para Coordenação
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(comissaoDevolver, id, justif)
            }} disabled={enviando} style={s.btnAmber}>
              ↩️ Devolver ao Orientador
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(comissaoReprovar, id, justif)
            }} disabled={enviando} style={s.btnRed}>
              ❌ Reprovar APO
            </button>
          </div>
        </div>
      )}

      {/* ── Coordenação ── */}
      {(podeCoordenacao || perfil === 'ADMIN') && (
        <div style={s.card}>
          <h2 style={s.sub}>Avaliação da Coordenação</h2>

          {(status === 'ENVIADA_COORDENACAO' || status === 'ABSTENCAO_ORIENTADOR') && (
            <button onClick={() => exec(coordenacaoIniciarAvaliacao, id)} disabled={enviando} style={{ ...s.btnBlue, marginBottom: 16 }}>
              🔍 Iniciar avaliação
            </button>
          )}

          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Alterar tipo de APO (opcional)</label>
            <select value={novoTipo} onChange={e => setNovoTipo(e.target.value)} style={s.input}>
              <option value="">Manter tipo atual: {apo.nomeTipoApo}</option>
              {tiposApo.filter(t => t.id !== apo.tipoApoId).map(t => (
                <option key={t.id} value={t.id}>{t.nome} ({t.creditos} créditos)</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={s.label}>Justificativa</label>
            <textarea value={justif} onChange={e => setJustif(e.target.value)}
              placeholder="Decisão e motivação..." style={s.textarea} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => exec(coordenacaoAprovar, id, novoTipo || null, justif)} disabled={enviando} style={s.btnGreen}>
              ✅ Aprovar e Encaminhar para Secretaria
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(coordenacaoDevolver, id, justif)
            }} disabled={enviando} style={s.btnAmber}>
              ↩️ Devolver ao Orientador
            </button>
            <button onClick={() => {
              if (!justif.trim()) { exibirToast('erro', 'Justificativa obrigatória'); return }
              exec(coordenacaoReprovar, id, justif)
            }} disabled={enviando} style={s.btnRed}>
              ❌ Reprovar APO
            </button>
          </div>
        </div>
      )}

      {/* ── Secretaria ── */}
      {(podeSecretaria || perfil === 'ADMIN') && (
        <div style={s.card}>
          <h2 style={s.sub}>Ações da Secretaria</h2>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {status === 'APROVADA_COORDENACAO' && (
              <button onClick={() => exec(secretariaAguardarAssinatura, id)} disabled={enviando} style={s.btnBlue}>
                📋 Registrar processo de assinatura
              </button>
            )}
            {status === 'AGUARDANDO_ASSINATURA' && (
              <button onClick={() => exec(secretariaAssinar, id)} disabled={enviando} style={s.btnGreen}>
                ✍️ Marcar como assinada
              </button>
            )}
            {status === 'ASSINADA' && (
              <button onClick={() => exec(secretariaArquivar, id)} disabled={enviando} style={s.btnGreen}>
                🗂️ Arquivar APO
              </button>
            )}
            {status === 'ARQUIVADA' && (
              <button onClick={() => exec(secretariaLancarSistema, id)} disabled={enviando} style={s.btnGreen}>
                🚀 Lançar no Sistema Acadêmico
              </button>
            )}
          </div>
          {(status === 'AGUARDANDO_ASSINATURA' || status === 'ARQUIVADA') && (
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 12 }}>
              ⚠️ O lançamento no sistema acadêmico só deve ser feito quando o aluno completar os créditos necessários.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

const s = {
  loading:    { textAlign: 'center', color: '#6b7280', padding: 60 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13 },
  link:       { color: '#1e40af', cursor: 'pointer' },
  titulo:     { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 0 },
  card:       { background: 'white', borderRadius: 12, padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,.08)' },
  sub:        { fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16, marginTop: 0 },
  label:      { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 5 },
  textarea:   { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px',
                fontSize: 13, resize: 'vertical', fontFamily: 'inherit', outline: 'none', minHeight: 80, boxSizing: 'border-box' },
  input:      { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px',
                fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 8 },
  btnGreen:   { flex: 1, padding: '12px 16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnAmber:   { flex: 1, padding: '12px 16px', background: '#d97706', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnRed:     { flex: 1, padding: '12px 16px', background: '#dc2626', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  btnBlue:    { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnGray:    { flex: 1, padding: '12px 16px', background: '#6b7280', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
}
