package com.extensflow.repository;

import com.extensflow.model.Usuario;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface UsuarioRepository extends MongoRepository<Usuario, String> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByEmailIgnoreCase(String email);
}
