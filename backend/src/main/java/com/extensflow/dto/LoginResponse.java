package com.extensflow.dto;

import java.util.List;

public class LoginResponse {
    private final String       token;
    private final Long         id;
    private final String       nome;
    private final String       email;
    private final String       perfil;
    private final boolean      admin;
    private final List<String> funcoes;

    public LoginResponse(String token, Long id, String nome, String email,
                         String perfil, boolean admin, List<String> funcoes) {
        this.token   = token;
        this.id      = id;
        this.nome    = nome;
        this.email   = email;
        this.perfil  = perfil;
        this.admin   = admin;
        this.funcoes = funcoes != null ? funcoes : List.of();
    }

    public String       getToken()   { return token; }
    public Long         getId()      { return id; }
    public String       getNome()    { return nome; }
    public String       getEmail()   { return email; }
    public String       getPerfil()  { return perfil; }
    public boolean      isAdmin()    { return admin; }
    public List<String> getFuncoes() { return funcoes; }
}
