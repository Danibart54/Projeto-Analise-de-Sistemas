import React from 'react';

const STATUS_MAP = {
  EM_PREENCHIMENTO: { label: 'Em Preenchimento', cls: 'badge-pending' },
  ENVIADA_PARA_ANALISE: { label: 'Enviada p/ Análise', cls: 'badge-analysis' },
  EM_AVALIACAO: { label: 'Em Avaliação', cls: 'badge-evaluating' },
  APROVADA: { label: 'Aprovada', cls: 'badge-approved' },
  REPROVADA: { label: 'Reprovada', cls: 'badge-rejected' },
  CANCELADA: { label: 'Cancelada', cls: 'badge-rejected' },
  CONCLUIDA: { label: 'Concluída', cls: 'badge-done' },
};

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'badge-pending' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
