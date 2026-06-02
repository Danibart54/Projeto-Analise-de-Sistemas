package com.extensflow.security;

import java.util.List;

public record UsuarioPrincipal(String id, String email, String role,
                                boolean admin, List<String> funcoes) {

    public UsuarioPrincipal(String id, String email, String role) {
        this(id, email, role, false, List.of());
    }
}
