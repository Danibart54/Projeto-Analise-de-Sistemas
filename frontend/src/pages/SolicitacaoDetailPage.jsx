import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  buscarSolicitacao, enviarSolicitacao, atualizarStatus,
  gerarDocumento, assinarDocumento, listarDocumentos
} from '../services/api'

const STATUS_CONFIG = {
  EM_PREENCHIMENTO: { label: 'Em preenchimento', color: '#6b7280', bg: '#f3f4f6' },
  ENVIADA_PARA_ANALISE: { label: 'Enviada para análise', color: '#f59e0b', bg: '#fffbeb' },
  EM_AVALIACAO: { label: 'Em avaliação', color: '#3b82f6', bg: '#eff6ff' },
  APROVADA: { label: 'Aprovada', color: '#10b981', bg: '#f0fdf4' },
  REPROVADA: { label: 'Reprovada', color: '#ef4444', bg: '#fef2f2' },
  CONCLUIDA: { label: 'Concluída', color: '#8b5cf6', bg: '#f5f3ff' },
  CANCELADA: { label: 'Cancelada', color: '#6b7280', bg: '#f3f4f6' },
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div style={styles.infoRow}>
      <span style={styles.infoLabel}>{label}</span>
      <span style={styles.infoValue}>{value}</span>
    </div>
  )
}

export default function SolicitacaoDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sol, setSol] = useState(null)
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { load() }, [id])

  async function load() {
    try {
      const [s, d] = await Promise.all([
        buscarSolicitacao(id),
        listarDocumentos(id).catch(() => [])
      ])
      setSol(s)
      setDocs(d)
    } catch (e) {
      setMsg('Erro ao carregar: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleEnviar() {
    if (!confirm('Confirmar envio para análise?')) return
    setActionLoading(true)
    try {
      const updated = await enviarSolicitacao(id)
      setSol(updated)
      setMsg('✅ Solicitação enviada para análise!')
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setActionLoading(false) }
  }

  async function handleStatusChange(novoStatus) {
    setActionLoading(true)
    try {
      const updated = await atualizarStatus(id, novoStatus)
      setSol(updated)
      setMsg('✅ Status atualizado!')
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setActionLoading(false) }
  }

  async function handleGerarDoc(tipo) {
    setActionLoading(true)
    try {
      const doc = await gerarDocumento(id, tipo)
      setDocs(d => [...d, doc])
      setMsg('✅ Documento gerado!')
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setActionLoading(false) }
  }

  async function handleAssinar(docId) {
    setActionLoading(true)
    try {
      const updated = await assinarDocumento(docId, user.nome)
      setDocs(d => d.map(doc => doc.id === docId ? updated : doc))
      setMsg('✅ Documento assinado!')
    } catch (e) { setMsg('❌ ' + e.message) }
    finally { setActionLoading(false) }
  }

  if (loading) return <div style={styles.loading}>Carregando...</div>
  if (!sol) return <div style={styles.loading}>Solicitação não encontrada</div>

  const cfg = STATUS_CONFIG[sol.status] || STATUS_CONFIG['EM_PREENCHIMENTO']
  const canAvalie = ['orientador', 'comissao'].includes(user.perfil) &&
    ['ENVIADA_PARA_ANALISE', 'EM_AVALIACAO'].includes(sol.status)
  const canEnviar = user.perfil === 'aluno' && sol.status === 'EM_PREENCHIMENTO'
  const canFinalize = user.perfil === 'comissao' && sol.status === 'EM_AVALIACAO'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={styles.breadcrumb}>
        <span onClick={() => navigate('/solicitacoes')} style={styles.breadcrumbLink}>Solicitações</span>
        <span>/</span>
        <span>#{id}</span>
      </div>

      {msg && (
        <div style={{ ...styles.alert, background: msg.startsWith('✅') ? '#f0fdf4' : '#fef2f2',
          borderColor: msg.startsWith('✅') ? '#86efac' : '#fecaca',
          color: msg.startsWith('✅') ? '#166534' : '#dc2626' }}>
          {msg}
          <button onClick={() => setMsg('')} style={styles.alertClose}>×</button>
        </div>
      )}

      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>{sol.titulo || `Solicitação #${id}`}</h1>
          <div style={styles.headerMeta}>
            {sol.nomeAluno && <span>👤 {sol.nomeAluno}</span>}
            {sol.dataEnvio && <span>📅 Enviado em {new Date(sol.dataEnvio).toLocaleDateString('pt-BR')}</span>}
            {sol.pontuacaoTotal != null && <span>⭐ {sol.pontuacaoTotal.toFixed(1)}</span>}
          </div>
        </div>
        <span style={{ ...styles.statusBadge, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
          {cfg.label}
        </span>
      </div>

      {sol.descricao && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Descrição</h2>
          <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>{sol.descricao}</p>
        </div>
      )}

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📋 Detalhes</h2>
        <InfoRow label="Status" value={cfg.label} />
        <InfoRow label="Formulário" value={sol.temFormulario ? '✅ Preenchido' : '⚠️ Pendente'} />
      </div>

      <div style={styles.card}>
        <h2 style={styles.cardTitle}>📄 Documentos ({docs.length})</h2>
        {docs.length === 0 ? (
          <p style={{ fontSize: 13, color: '#9ca3af' }}>Nenhum documento gerado ainda</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {docs.map(doc => (
              <div key={doc.id} style={styles.docItem}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{doc.tipo}</div>
                  {doc.assinado && (
                    <div style={{ fontSize: 12, color: '#10b981' }}>
                      ✅ Assinado por {doc.assinadoPor}
                    </div>
                  )}
                </div>
                {!doc.assinado && (
                  <button onClick={() => handleAssinar(doc.id)} style={styles.smallBtn}>
                    Assinar
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {canEnviar && (
          <button onClick={handleEnviar} disabled={actionLoading} style={styles.primaryBtn}>
            📤 Enviar para análise
          </button>
        )}

        {canAvalie && (
          <>
            <button onClick={() => navigate(`/solicitacoes/${id}/avaliar`)} style={styles.primaryBtn}>
              🔍 Registrar avaliação
            </button>
            <button onClick={() => handleStatusChange('EM_AVALIACAO')} style={styles.secondaryBtn}>
              ▶ Mover para "Em avaliação"
            </button>
          </>
        )}

        {canFinalize && (
          <>
            <button onClick={() => handleGerarDoc('DECISAO_FINAL')} style={styles.secondaryBtn}>
              📄 Gerar documento final
            </button>
            <button onClick={() => handleStatusChange('APROVADA')} style={{ ...styles.primaryBtn, background: '#10b981' }}>
              ✅ Aprovar
            </button>
            <button onClick={() => handleStatusChange('REPROVADA')} style={{ ...styles.primaryBtn, background: '#ef4444' }}>
              ❌ Reprovar
            </button>
          </>
        )}

        {user.perfil === 'aluno' && sol.status === 'EM_PREENCHIMENTO' && (
          <button onClick={() => handleGerarDoc('SOLICITACAO')} style={styles.secondaryBtn}>
            📄 Gerar documento de solicitação
          </button>
        )}
      </div>
    </div>
  )
}

const styles = {
  loading: { textAlign: 'center', padding: 64, color: '#6b7280' },
  breadcrumb: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#9ca3af', marginBottom: 16 },
  breadcrumbLink: { color: '#1e40af', cursor: 'pointer' },
  alert: { border: '1px solid', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  alertClose: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'inherit' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, gap: 16 },
  pageTitle: { fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 },
  headerMeta: { display: 'flex', gap: 16, fontSize: 13, color: '#6b7280' },
  statusBadge: { fontSize: 13, fontWeight: 600, padding: '6px 14px', borderRadius: 20, whiteSpace: 'nowrap', flexShrink: 0 },
  card: { background: 'white', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 },
  infoRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f3f4f6' },
  infoLabel: { fontSize: 13, color: '#6b7280' },
  infoValue: { fontSize: 13, fontWeight: 500, color: '#111827' },
  docItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f9fafb', borderRadius: 8 },
  actions: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 },
  primaryBtn: { background: '#1e40af', color: 'white', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  secondaryBtn: { background: 'white', color: '#1e40af', border: '1px solid #1e40af', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  smallBtn: { background: '#1e40af', color: 'white', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }
}
