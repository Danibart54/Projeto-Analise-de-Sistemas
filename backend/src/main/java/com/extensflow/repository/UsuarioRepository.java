package com.extensflow.repository;

import com.extensflow.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Spring Data gera automaticamente:
     *   SELECT u FROM Usuario u WHERE LOWER(u.email) = LOWER(:email)
     * Totalmente parametrizado — imune a SQL Injection.
     * IgnoreCase evita bypass por variação de maiúsculas no e-mail.
     */
    Optional<Usuario> findByEmailIgnoreCase(String email);

    // Mantemos findByEmail para compatibilidade, delegando para o seguro
    default Optional<Usuario> findByEmail(String email) {
        return findByEmailIgnoreCase(email);
    }

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN TRUE ELSE FALSE END " +
           "FROM Usuario u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);
}
