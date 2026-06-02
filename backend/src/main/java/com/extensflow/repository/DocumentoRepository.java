package com.extensflow.repository;

import com.extensflow.model.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DocumentoRepository extends JpaRepository<Documento, Long> {
    List<Documento> findBySolicitacaoId(Long solicitacaoId);
}
