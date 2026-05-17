package com.extensflow.repository;

import com.extensflow.model.EtapaAvaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EtapaAvaliacaoRepository extends JpaRepository<EtapaAvaliacao, Long> {
    List<EtapaAvaliacao> findByProcessoIdOrderByOrdem(Long processoId);
}
