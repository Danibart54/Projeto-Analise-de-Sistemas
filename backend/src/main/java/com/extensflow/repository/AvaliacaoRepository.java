package com.extensflow.repository;

import com.extensflow.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByAvaliadorId(Long avaliadorId);
    List<Avaliacao> findByEtapaId(Long etapaId);
}
