package com.extensflow.repository;

import com.extensflow.model.UsuarioV2;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

/** Alias para UsuarioV2Repository focado em alunos. */
public interface AlunoRepository extends MongoRepository<UsuarioV2, String> {
    Optional<UsuarioV2> findByMatricula(String matricula);
}
