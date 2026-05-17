package com.extensflow.repository;

import com.extensflow.model.Solicitacao;
import com.extensflow.model.StatusSolicitacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SolicitacaoRepository extends JpaRepository<Solicitacao, Long> {

    /**
     * Todos os métodos Spring Data usam JPQL parametrizado internamente.
     * Equivalente SQL gerado: WHERE aluno_id = ? (PreparedStatement)
     */
    List<Solicitacao> findByAlunoId(Long alunoId);

    /**
     * O parâmetro status é do tipo enum — nunca interpolado como String.
     * JPA converte para o valor string do enum (EnumType.STRING) via bind parameter.
     */
    List<Solicitacao> findByStatus(StatusSolicitacao status);

    /**
     * Busca com paginação segura via JPQL explícito.
     * Demonstra como usar @Query parametrizado quando necessário.
     */
    @Query("SELECT s FROM Solicitacao s WHERE s.aluno.id = :alunoId " +
           "AND (:status IS NULL OR s.status = :status) " +
           "ORDER BY s.dataEnvio DESC")
    List<Solicitacao> findByAlunoIdAndStatusOptional(
            @Param("alunoId") Long alunoId,
            @Param("status")  StatusSolicitacao status);
}
