package com.extensflow.repository;

import com.extensflow.model.AprovacaoSolicitacao;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AprovacaoSolicitacaoRepository extends MongoRepository<AprovacaoSolicitacao, String> {
    List<AprovacaoSolicitacao> findBySolicitacaoId(String solicitacaoId);
    long countBySolicitacaoId(String solicitacaoId);
    boolean existsBySolicitacaoIdAndCoordenadorId(String solicitacaoId, String coordenadorId);
}
