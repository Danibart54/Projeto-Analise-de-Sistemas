package com.extensflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class UsuarioDTO {
    @NotBlank
    private String nome;
    @Email @NotBlank
    private String email;
    @NotBlank @Size(min = 8)
    private String senha;
    private String perfil;
    private String matricula;
    private String curso;
    private String areaAtuacao;
    private String titulacao;
    private String especialidade;
    private String instituicao;

    public String getNome()                  { return nome; }
    public void   setNome(String v)          { this.nome = v; }
    public String getEmail()                 { return email; }
    public void   setEmail(String v)         { this.email = v; }
    public String getSenha()                 { return senha; }
    public void   setSenha(String v)         { this.senha = v; }
    public String getPerfil()                { return perfil; }
    public void   setPerfil(String v)        { this.perfil = v; }
    public String getMatricula()             { return matricula; }
    public void   setMatricula(String v)     { this.matricula = v; }
    public String getCurso()                 { return curso; }
    public void   setCurso(String v)         { this.curso = v; }
    public String getAreaAtuacao()           { return areaAtuacao; }
    public void   setAreaAtuacao(String v)   { this.areaAtuacao = v; }
    public String getTitulacao()             { return titulacao; }
    public void   setTitulacao(String v)     { this.titulacao = v; }
    public String getEspecialidade()         { return especialidade; }
    public void   setEspecialidade(String v) { this.especialidade = v; }
    public String getInstituicao()           { return instituicao; }
    public void   setInstituicao(String v)   { this.instituicao = v; }
}
