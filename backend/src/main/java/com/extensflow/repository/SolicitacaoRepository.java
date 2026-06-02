package com.extensflow.repository;

import com.extensflow.model.Solicitacao;
import com.extensflow.model.StatusSolicitacao;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SolicitacaoRepository extends MongoRepository<Solicitacao, String> {
    List<Solicitacao> findByAlunoId(String alunoId);
    List<Solicitacao> findByOrientadorId(String orientadorId);
    List<Solicitacao> findByStatus(StatusSolicitacao status);
    Page<Solicitacao> findByStatus(StatusSolicitacao status, Pageable pageable);
    List<Solicitacao> findByAlunoIdAndStatus(String alunoId, StatusSolicitacao status);
}
