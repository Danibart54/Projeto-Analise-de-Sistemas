package com.extensflow.repository;

import com.extensflow.model.Funcao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FuncaoRepository extends JpaRepository<Funcao, Long> {
    Optional<Funcao> findByNomeIgnoreCase(String nome);
}
