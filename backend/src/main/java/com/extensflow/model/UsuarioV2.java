package com.extensflow.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "usuarios")
public class UsuarioV2 {

    @Id
    private String id;

    @NotBlank(message = "Nome é obrigatório")
    private String nome;

    @Email(message = "E-mail inválido")
    @Indexed(unique = true)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String senha;

    private String telefone;
    private String curso;
    private String tipoAluno;
    private String matricula;
    private String orientadorVinculadoId;
    private Integer creditosAprovados = 0;
    private String setor;
    private String areaAtuacao;
    private String titulacao;
    private String especialidade;
    private boolean ativo  = true;
    private boolean admin  = false;
    private LocalDateTime dataCriacao = LocalDateTime.now();

    private List<String> funcoes = new ArrayList<>();

    public String  getId()                                  { return id; }
    public String  getNome()                                { return nome; }
    public void    setNome(String nome)                     { this.nome = nome; }
    public String  getEmail()                               { return email; }
    public void    setEmail(String email)                   { this.email = email; }
    public String  getSenha()                               { return senha; }
    public void    setSenha(String senha)                   { this.senha = senha; }
    public String  getTelefone()                            { return telefone; }
    public void    setTelefone(String t)                    { this.telefone = t; }
    public String  getCurso()                               { return curso; }
    public void    setCurso(String curso)                   { this.curso = curso; }
    public String  getTipoAluno()                           { return tipoAluno; }
    public void    setTipoAluno(String tipoAluno)           { this.tipoAluno = tipoAluno; }
    public String  getMatricula()                           { return matricula; }
    public void    setMatricula(String matricula)           { this.matricula = matricula; }
    public String  getOrientadorVinculadoId()              { return orientadorVinculadoId; }
    public void    setOrientadorVinculadoId(String id)      { this.orientadorVinculadoId = id; }
    public Integer getCreditosAprovados()                   { return creditosAprovados; }
    public void    setCreditosAprovados(Integer c)          { this.creditosAprovados = c; }
    public String  getSetor()                               { return setor; }
    public void    setSetor(String setor)                   { this.setor = setor; }
    public String  getAreaAtuacao()                         { return areaAtuacao; }
    public void    setAreaAtuacao(String a)                 { this.areaAtuacao = a; }
    public String  getTitulacao()                           { return titulacao; }
    public void    setTitulacao(String t)                   { this.titulacao = t; }
    public String  getEspecialidade()                       { return especialidade; }
    public void    setEspecialidade(String e)               { this.especialidade = e; }
    public boolean isAtivo()                                { return ativo; }
    public void    setAtivo(boolean ativo)                  { this.ativo = ativo; }
    public boolean isAdmin()                                { return admin; }
    public void    setAdmin(boolean admin)                  { this.admin = admin; }
    public LocalDateTime getDataCriacao()                   { return dataCriacao; }
    public List<String> getFuncoes()                        { return funcoes; }
    public void    setFuncoes(List<String> funcoes)         { this.funcoes = funcoes; }

    public boolean temFuncao(String nomeFuncao) {
        return funcoes != null && funcoes.stream()
                .anyMatch(f -> f.equalsIgnoreCase(nomeFuncao));
    }
}
