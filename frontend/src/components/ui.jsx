/* ─────────────────────────────────────────────────────────────────────────────
   ui.jsx  —  Componentes compartilhados do ExtensFlow (novo design)
───────────────────────────────────────────────────────────────────────────── */

/* ── Status config ─────────────────────────────────────────────────────────── */
export const STATUS_CONFIG = {
  // Fluxo APO
  RASCUNHO:                 { label: 'Rascunho',                  color: '#64748b', bg: '#f1f5f9' },
  ENVIADA_ORIENTADOR:       { label: 'Enviada ao Orientador',     color: '#0891b2', bg: '#ecfeff' },
  EM_AVALIACAO_ORIENTADOR:  { label: 'Em Avaliação (Orientador)', color: '#0284c7', bg: '#e0f2fe' },
  DEVOLVIDA_ALUNO:          { label: 'Devolvida ao Aluno',        color: '#d97706', bg: '#fffbeb' },
  ABSTENCAO_ORIENTADOR:     { label: 'Abstenção do Orientador',   color: '#7c3aed', bg: '#f5f3ff' },
  APROVADA_ORIENTADOR:      { label: 'Aprovada pelo Orientador',  color: '#065f46', bg: '#d1fae5' },
  ENVIADA_COMISSAO:         { label: 'Enviada à Comissão',        color: '#0891b2', bg: '#ecfeff' },
  EM_AVALIACAO_COMISSAO:    { label: 'Em Avaliação (Comissão)',   color: '#2563eb', bg: '#eff6ff' },
  DEVOLVIDA_ORIENTADOR:     { label: 'Devolvida ao Orientador',   color: '#d97706', bg: '#fffbeb' },
  APROVADA_COMISSAO:        { label: 'Aprovada pela Comissão',    color: '#065f46', bg: '#d1fae5' },
  ENVIADA_COORDENACAO:      { label: 'Enviada à Coordenação',     color: '#0891b2', bg: '#ecfeff' },
  EM_AVALIACAO_COORDENACAO: { label: 'Em Avaliação (Coordenação)',color: '#2563eb', bg: '#eff6ff' },
  APROVADA_COORDENACAO:     { label: 'Aprovada pela Coordenação', color: '#065f46', bg: '#d1fae5' },
  ENVIADA_SECRETARIA:       { label: 'Enviada à Secretaria',      color: '#0891b2', bg: '#ecfeff' },
  AGUARDANDO_ASSINATURA:    { label: 'Aguardando Assinatura',     color: '#d97706', bg: '#fffbeb' },
  ASSINADA:                 { label: 'Assinada',                  color: '#15803d', bg: '#f0fdf4' },
  ARQUIVADA:                { label: 'Arquivada',                 color: '#15803d', bg: '#f0fdf4' },
  LANCADA_SISTEMA:          { label: 'Lançada no Sistema',        color: '#15803d', bg: '#dcfce7' },
  FINALIZADA:               { label: 'Finalizada',               color: '#7c3aed', bg: '#f5f3ff' },
  REPROVADA_CANCELADA:      { label: 'Reprovada/Cancelada',       color: '#dc2626', bg: '#fef2f2' },
  // Legados
  EM_PREENCHIMENTO:         { label: 'Em preenchimento',          color: '#64748b', bg: '#f1f5f9' },
  ENVIADA_PARA_ANALISE:     { label: 'Aguardando coordenadores',  color: '#d97706', bg: '#fffbeb' },
  APROVADA_COORDENADORES:   { label: 'Aprovada pelos coord.',     color: '#065f46', bg: '#d1fae5' },
  RECUSADA_COORDENADORES:   { label: 'Recusada pelos coord.',     color: '#dc2626', bg: '#fef2f2' },
  APROVADA_FINAL:           { label: 'Aprovada final',            color: '#15803d', bg: '#f0fdf4' },
  RECUSADA_FINAL:           { label: 'Recusada final',            color: '#991b1b', bg: '#fef2f2' },
  EM_AVALIACAO:             { label: 'Em avaliação',              color: '#2563eb', bg: '#eff6ff' },
  APROVADA:                 { label: 'Aprovada',                  color: '#16a34a', bg: '#f0fdf4' },
  REPROVADA:                { label: 'Reprovada',                 color: '#dc2626', bg: '#fef2f2' },
  CONCLUIDA:                { label: 'Concluída',                 color: '#7c3aed', bg: '#f5f3ff' },
  CANCELADA:                { label: 'Cancelada',                 color: '#64748b', bg: '#f1f5f9' },
}

// Ordem das etapas para o stepper visual
export const ETAPAS_FLUXO = [
  { status: ['RASCUNHO'],                                    label: 'Criada',        short: 'Criada' },
  { status: ['ENVIADA_ORIENTADOR','EM_AVALIACAO_ORIENTADOR','DEVOLVIDA_ALUNO','ABSTENCAO_ORIENTADOR'], label: 'Orientador', short: 'Orientador' },
  { status: ['APROVADA_ORIENTADOR','ENVIADA_COMISSAO','EM_AVALIACAO_COMISSAO','DEVOLVIDA_ORIENTADOR'], label: 'Comissão',   short: 'Comissão' },
  { status: ['APROVADA_COMISSAO','ENVIADA_COORDENACAO','EM_AVALIACAO_COORDENACAO'],                    label: 'Coordenação',short: 'Coord.' },
  { status: ['APROVADA_COORDENACAO','ENVIADA_SECRETARIA','AGUARDANDO_ASSINATURA'],                     label: 'Secretaria', short: 'Secretaria' },
  { status: ['ASSINADA','ARQUIVADA'],                        label: 'Arquivada',     short: 'Arquivada' },
  { status: ['LANCADA_SISTEMA','FINALIZADA'],                label: 'Lançada',       short: 'Lançada' },
]

/* ── Badge ─────────────────────────────────────────────────────────────────── */
export function Badge({ status, label }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['EM_PREENCHIMENTO']
  const text = label || cfg.label
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: 20,
      fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
      color: cfg.color, background: cfg.bg,
    }}>
      {text}
    </span>
  )
}

/* ── PageHeader ────────────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      marginBottom: 22,
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-.02em' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 3 }}>{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/* ── PrimaryButton ─────────────────────────────────────────────────────────── */
export function PrimaryButton({ children, onClick, style, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--blue)', color: 'white', border: 'none',
        borderRadius: 9, padding: '8px 16px',
        fontSize: 13, fontWeight: 600, cursor: 'pointer',
        transition: 'background .15s',
        opacity: disabled ? .6 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ── OutlineButton ─────────────────────────────────────────────────────────── */
export function OutlineButton({ children, onClick, style }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'var(--white)', color: 'var(--gray)',
        border: '1px solid var(--gray-2)',
        borderRadius: 9, padding: '8px 14px',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        transition: 'all .15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ── Card ──────────────────────────────────────────────────────────────────── */
export function Card({ children, style, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--gray-2)',
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'box-shadow .15s, transform .15s' : undefined,
        ...style,
      }}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.transform = 'none'
      } : undefined}
    >
      {children}
    </div>
  )
}

/* ── CardHeader ────────────────────────────────────────────────────────────── */
export function CardHeader({ title, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '13px 16px 11px',
      borderBottom: '1px solid var(--gray-2)',
    }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>{title}</span>
      {action}
    </div>
  )
}

/* ── EmptyState ────────────────────────────────────────────────────────────── */
export function EmptyState({ icon = '📭', message, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--gray)' }}>
      <div style={{ fontSize: 38, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontSize: 14, marginBottom: action ? 16 : 0 }}>{message}</p>
      {action}
    </div>
  )
}

/* ── LoadingSpinner ────────────────────────────────────────────────────────── */
export function LoadingSpinner() {
  return (
    <div style={{ textAlign: 'center', padding: '56px 0', color: 'var(--gray)', fontSize: 14 }}>
      Carregando...
    </div>
  )
}

/* ── PageWrapper ────────────────────────────────────────────────────────────── */
export function PageWrapper({ children }) {
  return (
    <div style={{ padding: '28px 28px', minHeight: '100vh', background: 'var(--gray-4)' }}>
      {children}
    </div>
  )
}

/* ── Avatar ────────────────────────────────────────────────────────────────── */
const PERFIL_COLORS = {
  aluno: '#7c3aed', orientador: '#8b5cf6', comissao: '#d97706',
  secretaria: '#2563eb', coordenadoria: '#db2777', admin: '#dc2626',
}

export function Avatar({ nome, perfil, size = 36 }) {
  const initials = nome?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  const bg = PERFIL_COLORS[(perfil || '').toLowerCase()] || '#64748b'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, color: 'white', flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}
