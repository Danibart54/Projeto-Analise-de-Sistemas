import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PERFIL_CONFIG = {
  ADMIN:             { label: 'Administrador',      icon: '⚙️', desc: 'Gerenciar usuários, tipos de APO e relatórios' },
  ALUNO:             { label: 'Aluno',              icon: '🎓', desc: 'Criar e acompanhar suas APOs' },
  ORIENTADOR:        { label: 'Orientador',         icon: '👨‍🏫', desc: 'Avaliar APOs dos seus alunos orientandos' },
  SECRETARIA:        { label: 'Secretaria',         icon: '🗂️', desc: 'Processar, arquivar e lançar APOs aprovadas' },
  COMISSAO_JULGADORA:{ label: 'Comissão Julgadora', icon: '⚖️', desc: 'Avaliar APOs encaminhadas pelo orientador' },
  COORDENADOR:       { label: 'Coordenação',        icon: '🏛️', desc: 'Avaliar APOs aprovadas pela comissão' },
  COORDENADORIA:     { label: 'Coordenação',        icon: '🏛️', desc: 'Avaliar APOs aprovadas pela comissão' },
  SECRETARIO:        { label: 'Secretaria',         icon: '🗂️', desc: 'Processar, arquivar e lançar APOs aprovadas' },
}

function normalizar(funcao) {
  if (!funcao) return funcao
  const f = funcao.toUpperCase()
  if (f === 'SECRETARIO')         return 'SECRETARIA'
  if (f === 'COORDENADOR')        return 'COORDENADORIA'
  if (f === 'COMISSAO_JULGADORA') return 'COMISSAO_JULGADORA'
  return f
}

export default function ProfileSelectionPage() {
  const { user, selecionarPerfil } = useAuth()
  const navigate = useNavigate()

  if (!user) {
    navigate('/login')
    return null
  }

  const funcoes = user.funcoes || [user.perfil]
  const funcoesUnicas = [...new Set(funcoes.map(normalizar).filter(Boolean))]

  function handleSelecionar(funcao) {
    selecionarPerfil(funcao)
    navigate('/dashboard')
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={s.header}>
          <div style={s.avatar}>{user.nome?.charAt(0)?.toUpperCase()}</div>
          <div>
            <div style={s.nome}>{user.nome}</div>
            <div style={s.sub}>Selecione o perfil de acesso para esta sessão</div>
          </div>
        </div>

        <div style={s.divider} />

        <div style={s.grid}>
          {funcoesUnicas.map(funcao => {
            const cfg = PERFIL_CONFIG[funcao] || { label: funcao, icon: '👤', desc: 'Acesso ao sistema' }
            return (
              <button key={funcao} style={s.btn} onClick={() => handleSelecionar(funcao)}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--blue)'
                  e.currentTarget.style.background  = 'var(--blue-4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--gray-2)'
                  e.currentTarget.style.background  = 'var(--white)'
                }}
              >
                <span style={{ fontSize: 28 }}>{cfg.icon}</span>
                <div style={s.btnLabel}>{cfg.label}</div>
                <div style={s.btnDesc}>{cfg.desc}</div>
              </button>
            )
          })}
        </div>

        <p style={s.footer}>
          Sistema APO — PPGCA · Universidade Presbiteriana Mackenzie
        </p>
      </div>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--gray-4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
  },
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--gray-2)',
    padding: '36px 40px',
    width: '100%', maxWidth: 560,
    boxShadow: 'var(--shadow-md)',
  },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 },
  avatar: {
    width: 52, height: 52, borderRadius: '50%',
    background: 'var(--blue)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 22, fontWeight: 700, flexShrink: 0,
  },
  nome:    { fontSize: 18, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-.02em' },
  sub:     { fontSize: 13, color: 'var(--gray)', marginTop: 2 },
  divider: { height: 1, background: 'var(--gray-2)', margin: '0 0 24px' },
  grid:    { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  btn: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4,
    background: 'var(--white)', border: '1.5px solid var(--gray-2)',
    borderRadius: 'var(--radius-lg)', padding: '16px 20px',
    cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
    fontFamily: 'inherit',
  },
  btnLabel: { fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginTop: 4 },
  btnDesc:  { fontSize: 12, color: 'var(--gray)', lineHeight: 1.4 },
  footer:   { fontSize: 11, color: 'var(--gray)', textAlign: 'center' },
}
