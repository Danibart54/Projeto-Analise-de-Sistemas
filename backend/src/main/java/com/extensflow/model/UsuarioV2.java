package com.extensflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios_v2")
public class UsuarioV2 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Nome é obrigatório")
    @Column(nullable = false, length = 150)
    private String nome;

    @Email(message = "E-mail inválido")
    @Column(unique = true, nullable = false, length = 254)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false)
    private String senha;

    @Column(length = 20)
    private String telefone;

    @Column(length = 100)
    private String curso;

    @Column(length = 20)
    private String tipoAluno; // GRADUACAO | MESTRADO | DOUTORADO

    @Column(length = 30)
    private String matricula;

    @Column(name = "orientador_vinculado_id")
    private Long orientadorVinculadoId;

    @Column(name = "creditos_aprovados")
    private Integer creditosAprovados = 0;

    @Column(length = 100)
    private String setor;

    @Column(nullable = false)
    private boolean ativo = true;

    /** Acesso de administrador — pode ver todos os usuários e atribuir funções. */
    @Column(nullable = false)
    private boolean admin = false;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.MERGE})
    @JoinTable(
        name = "usuario_funcoes",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "funcao_id")
    )
    private Set<Funcao> funcoes = new HashSet<>();

    public Long getId()                           { return id; }
    public String getNome()                       { return nome; }
    public void setNome(String nome)              { this.nome = nome; }
    public String getEmail()                      { return email; }
    public void setEmail(String email)            { this.email = email; }
    public String getSenha()                      { return senha; }
    public void setSenha(String senha)            { this.senha = senha; }
    public String getTelefone()                   { return telefone; }
    public void setTelefone(String telefone)      { this.telefone = telefone; }
    public String getCurso()                                       { return curso; }
    public void   setCurso(String curso)                           { this.curso = curso; }
    public String getTipoAluno()                                   { return tipoAluno; }
    public void   setTipoAluno(String tipoAluno)                   { this.tipoAluno = tipoAluno; }
    public String getMatricula()                                   { return matricula; }
    public void   setMatricula(String matricula)                   { this.matricula = matricula; }
    public Long   getOrientadorVinculadoId()                      { return orientadorVinculadoId; }
    public void   setOrientadorVinculadoId(Long id)               { this.orientadorVinculadoId = id; }
    public Integer getCreditosAprovados()                          { return creditosAprovados; }
    public void   setCreditosAprovados(Integer c)                  { this.creditosAprovados = c; }
    public String getSetor()                                       { return setor; }
    public void setSetor(String setor)            { this.setor = setor; }
    public boolean isAtivo()                      { return ativo; }
    public void setAtivo(boolean ativo)           { this.ativo = ativo; }
    public boolean isAdmin()                      { return admin; }
    public void setAdmin(boolean admin)           { this.admin = admin; }
    public LocalDateTime getDataCriacao()         { return dataCriacao; }
    public Set<Funcao> getFuncoes()               { return funcoes; }
    public void setFuncoes(Set<Funcao> funcoes)   { this.funcoes = funcoes; }

    public boolean temFuncao(String nomeFuncao) {
        return funcoes.stream().anyMatch(f -> f.getNome().equalsIgnoreCase(nomeFuncao));
    }
}
