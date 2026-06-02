package com.extensflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "usuarios")
@Inheritance(strategy = InheritanceType.JOINED)
public abstract class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Email(message = "E-mail inválido")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    // V-03: WRITE_ONLY — campo nunca serializado em respostas JSON
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private boolean ativo = true;

    @Enumerated(EnumType.STRING)
    private TipoUsuario tipoUsuario;

    public Long getId()                          { return id; }
    public String getNome()                      { return nome; }
    public void setNome(String nome)             { this.nome = nome; }
    public String getEmail()                     { return email; }
    public void setEmail(String email)           { this.email = email; }
    public String getSenha()                     { return senha; }
    public void setSenha(String senha)           { this.senha = senha; }
    public boolean isAtivo()                     { return ativo; }
    public void setAtivo(boolean ativo)          { this.ativo = ativo; }
    public TipoUsuario getTipoUsuario()          { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario t)    { this.tipoUsuario = t; }
}
