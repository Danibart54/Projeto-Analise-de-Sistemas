package com.extensflow.repository;

/**
 * Histórico de APO agora é embutido em Solicitacao.historico.
 * Interface mantida para não quebrar imports existentes.
 */
public interface HistoricoApoRepository {
    // Histórico embutido em Solicitacao — use solicitacaoRepo.findById().getHistorico()
}
