package com.extensflow.repository;

import com.extensflow.model.HistoricoApo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HistoricoApoRepository extends JpaRepository<HistoricoApo, Long> {
    List<HistoricoApo> findBySolicitacaoIdOrderByDataAsc(Long solicitacaoId);
}
