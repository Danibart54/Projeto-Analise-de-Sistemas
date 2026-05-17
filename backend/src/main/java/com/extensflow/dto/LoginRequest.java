package com.extensflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class LoginRequest {

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Size(max = 254, message = "E-mail deve ter no máximo 254 caracteres")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    // Limite superior essencial: BCrypt de senha 1MB pode levar segundos e causar DoS
    @Size(min = 1, max = 128, message = "Senha deve ter no máximo 128 caracteres")
    private String senha;

    public String getEmail()            { return email; }
    public void   setEmail(String e)    { this.email = e; }
    public String getSenha()            { return senha; }
    public void   setSenha(String s)    { this.senha = s; }
}
