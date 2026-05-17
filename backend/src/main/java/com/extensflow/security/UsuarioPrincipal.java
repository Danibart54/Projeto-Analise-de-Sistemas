package com.extensflow.security;

/**
 * Representa o usuário autenticado extraído do JWT.
 * Armazenado no SecurityContextHolder durante a requisição.
 */
public record UsuarioPrincipal(Long id, String email, String role) {}
