package com.extensflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Modelo legado de usuário — mantido para compatibilidade com AuthService.
 * No novo fluxo, prefira UsuarioV2.
 */
@Document(collection = "usuarios_legado")
public abstract class Usuario {

    @Id
    private String id;

    private String nome;

    @Indexed(unique = true)
    private String email;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private boolean ativo = true;
    private TipoUsuario tipoUsuario;

    public String getId()                          { return id; }
    public String getNome()                        { return nome; }
    public void setNome(String nome)               { this.nome = nome; }
    public String getEmail()                       { return email; }
    public void setEmail(String email)             { this.email = email; }
    public String getSenha()                       { return senha; }
    public void setSenha(String senha)             { this.senha = senha; }
    public boolean isAtivo()                       { return ativo; }
    public void setAtivo(boolean ativo)            { this.ativo = ativo; }
    public TipoUsuario getTipoUsuario()            { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario t)      { this.tipoUsuario = t; }
}
