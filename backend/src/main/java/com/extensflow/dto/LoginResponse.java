package com.extensflow.dto;

public class LoginResponse {
    private String token;   // JWT — adicionado
    private String nome;
    private String email;
    private String perfil;

    public LoginResponse(String token, String nome, String email, String perfil) {
        this.token  = token;
        this.nome   = nome;
        this.email  = email;
        this.perfil = perfil;
    }

    public String getToken()  { return token; }
    public String getNome()   { return nome; }
    public String getEmail()  { return email; }
    public String getPerfil() { return perfil; }
}
