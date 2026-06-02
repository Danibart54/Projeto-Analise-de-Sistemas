package com.extensflow.security;

import java.util.List;

/**
 * Representa o usuário autenticado extraído do JWT.
 * Armazenado no SecurityContextHolder durante a requisição.
 *
 * - role:   perfil principal (usado nas regras do SecurityConfig)
 * - admin:  flag de administrador — extraído do JWT, sem query extra ao banco
 * - funcoes: todas as funções do usuário V2 (authorities granulares)
 */
public record UsuarioPrincipal(Long id, String email, String role,
                                boolean admin, List<String> funcoes) {

    /** Compat: constrói sem funcoes (usuários legados). */
    public UsuarioPrincipal(Long id, String email, String role) {
        this(id, email, role, false, List.of());
    }
}
