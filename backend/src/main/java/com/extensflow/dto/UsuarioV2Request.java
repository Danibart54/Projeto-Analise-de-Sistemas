package com.extensflow.dto;

import jakarta.validation.constraints.*;
import java.util.List;

/** DTO de entrada para cadastro/edição de usuário com múltiplas funções. */
public class UsuarioV2Request {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
    @Pattern(regexp = "^[\\p{L}\\p{M}\\s'.\\-]+$", message = "Nome contém caracteres inválidos")
    private String nome;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Size(max = 254, message = "E-mail deve ter no máximo 254 caracteres")
    private String email;

    @Size(min = 8, max = 128, message = "Senha deve ter entre 8 e 128 caracteres")
    private String senha;

    @Pattern(regexp = "^\\+?[0-9\\s\\-().]{7,20}$", message = "Telefone inválido")
    private String telefone;

    @Size(max = 100, message = "Curso deve ter no máximo 100 caracteres")
    private String curso;

    @Size(max = 100, message = "Setor deve ter no máximo 100 caracteres")
    private String setor;

    /**
     * Lista de nomes de funções a serem associadas.
     * Exemplos: ["COORDENADOR", "ORIENTADOR"]
     * Deve conter ao menos uma função.
     */
    @NotNull(message = "Ao menos uma função deve ser informada")
    @Size(min = 1, message = "Ao menos uma função deve ser informada")
    private List<String> funcoes;

    public String getNome()                         { return nome; }
    public void   setNome(String nome)              { this.nome = nome; }
    public String getEmail()                        { return email; }
    public void   setEmail(String email)            { this.email = email; }
    public String getSenha()                        { return senha; }
    public void   setSenha(String senha)            { this.senha = senha; }
    public String getTelefone()                     { return telefone; }
    public void   setTelefone(String telefone)      { this.telefone = telefone; }
    public String getCurso()                        { return curso; }
    public void   setCurso(String curso)            { this.curso = curso; }
    public String getSetor()                        { return setor; }
    public void   setSetor(String setor)            { this.setor = setor; }
    public List<String> getFuncoes()                { return funcoes; }
    public void   setFuncoes(List<String> funcoes)  { this.funcoes = funcoes; }
}
