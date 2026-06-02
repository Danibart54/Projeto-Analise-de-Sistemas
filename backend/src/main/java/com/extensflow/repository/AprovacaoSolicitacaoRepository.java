package com.extensflow.repository;

import com.extensflow.model.AprovacaoSolicitacao;
import com.extensflow.model.AprovacaoSolicitacao.Voto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AprovacaoSolicitacaoRepository extends JpaRepository<AprovacaoSolicitacao, Long> {

    boolean existsBySolicitacaoIdAndCoordenadorId(Long solicitacaoId, Long coordenadorId);

    @Query("SELECT COUNT(a) FROM AprovacaoSolicitacao a WHERE a.solicitacao.id = :id")
    long countBySolicitacaoId(@Param("id") Long solicitacaoId);

    @Query("SELECT COUNT(a) FROM AprovacaoSolicitacao a WHERE a.solicitacao.id = :id AND a.voto = :voto")
    long countBySolicitacaoIdAndVoto(@Param("id") Long solicitacaoId, @Param("voto") Voto voto);

    List<AprovacaoSolicitacao> findBySolicitacaoId(Long solicitacaoId);
}
