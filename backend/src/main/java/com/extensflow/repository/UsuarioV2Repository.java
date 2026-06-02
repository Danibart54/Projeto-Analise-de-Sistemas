package com.extensflow.repository;

import com.extensflow.model.UsuarioV2;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioV2Repository extends JpaRepository<UsuarioV2, Long> {

    Optional<UsuarioV2> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    /** Busca todos os usuários que possuem determinada função. */
    @Query("SELECT u FROM UsuarioV2 u JOIN u.funcoes f WHERE f.nome = :nomeFuncao")
    List<UsuarioV2> findByFuncaoNome(@Param("nomeFuncao") String nomeFuncao);
}
