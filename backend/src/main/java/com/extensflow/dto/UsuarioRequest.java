package com.extensflow.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class UsuarioRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
    // Bloqueia injeção de HTML/scripts no campo nome
    @Pattern(
        regexp = "^[\\p{L}\\p{M}\\s'.\\-]+$",
        message = "Nome contém caracteres inválidos"
    )
    private String nome;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Size(max = 254, message = "E-mail deve ter no máximo 254 caracteres")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 128, message = "Senha deve ter entre 8 e 128 caracteres")
    private String senha;

    // Validado no controller — admin usa "orientador" ou "membro_comissao"
    @Pattern(
        regexp = "^(aluno|orientador|membro_comissao)$",
        message = "Tipo deve ser aluno, orientador ou membro_comissao"
    )
    private String tipo;

    @Size(max = 20,  message = "Matrícula deve ter no máximo 20 caracteres")
    @Pattern(regexp = "^[A-Za-z0-9\\-]*$", message = "Matrícula contém caracteres inválidos")
    private String matricula;

    @Size(max = 100, message = "Curso deve ter no máximo 100 caracteres")
    private String curso;

    @Size(max = 100, message = "Área de atuação deve ter no máximo 100 caracteres")
    private String areaAtuacao;

    @Size(max = 50,  message = "Titulação deve ter no máximo 50 caracteres")
    private String titulacao;

    @Size(max = 100, message = "Especialidade deve ter no máximo 100 caracteres")
    private String especialidade;

    @Size(max = 150, message = "Instituição deve ter no máximo 150 caracteres")
    private String instituicao;

    public String getNome()                         { return nome; }
    public void   setNome(String nome)              { this.nome = nome; }
    public String getEmail()                        { return email; }
    public void   setEmail(String email)            { this.email = email; }
    public String getSenha()                        { return senha; }
    public void   setSenha(String senha)            { this.senha = senha; }
    public String getTipo()                         { return tipo; }
    public void   setTipo(String tipo)              { this.tipo = tipo; }
    public String getMatricula()                    { return matricula; }
    public void   setMatricula(String matricula)    { this.matricula = matricula; }
    public String getCurso()                        { return curso; }
    public void   setCurso(String curso)            { this.curso = curso; }
    public String getAreaAtuacao()                  { return areaAtuacao; }
    public void   setAreaAtuacao(String a)          { this.areaAtuacao = a; }
    public String getTitulacao()                    { return titulacao; }
    public void   setTitulacao(String t)            { this.titulacao = t; }
    public String getEspecialidade()                { return especialidade; }
    public void   setEspecialidade(String e)        { this.especialidade = e; }
    public String getInstituicao()                  { return instituicao; }
    public void   setInstituicao(String i)          { this.instituicao = i; }
}
