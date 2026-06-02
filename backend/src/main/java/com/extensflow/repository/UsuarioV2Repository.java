package com.extensflow.repository;

import com.extensflow.model.UsuarioV2;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioV2Repository extends MongoRepository<UsuarioV2, String> {
    Optional<UsuarioV2> findByEmailIgnoreCase(String email);
    boolean             existsByEmailIgnoreCase(String email);
    List<UsuarioV2>     findByAtivoTrue();
    List<UsuarioV2>     findByFuncoesContainingIgnoreCase(String funcao);
}
