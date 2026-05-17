package com.extensflow.repository;

import com.extensflow.model.ProcessoAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProcessoAvaliacaoRepository extends JpaRepository<ProcessoAvaliacao, Long> {
    Optional<ProcessoAvaliacao> findBySolicitacaoId(Long solicitacaoId);
}
