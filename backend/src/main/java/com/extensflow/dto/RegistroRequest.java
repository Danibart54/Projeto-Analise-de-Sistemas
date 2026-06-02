package com.extensflow.dto;

import jakarta.validation.constraints.*;

/**
 * DTO para auto-cadastro público de novos usuários.
 * Apenas funções não-privilegiadas são permitidas (ALUNO, ORIENTADOR).
 * Funções administrativas (SECRETARIO, COORDENADOR, COMISSAO_JULGADORA)
 * só podem ser atribuídas por um admin.
 */
public class RegistroRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 150, message = "Nome deve ter entre 2 e 150 caracteres")
    @Pattern(regexp = "^[\\p{L}\\p{M}\\s'.\\-]+$", message = "Nome contém caracteres inválidos")
    private String nome;

    @Email(message = "E-mail inválido")
    @NotBlank(message = "E-mail é obrigatório")
    @Size(max = 254)
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 8, max = 128, message = "Senha deve ter entre 8 e 128 caracteres")
    private String senha;

    /**
     * Função desejada. Aceita apenas ALUNO ou ORIENTADOR.
     * Qualquer outra função é rejeitada pelo serviço.
     */
    @NotBlank(message = "Função é obrigatória")
    private String funcao;

    @Size(max = 20)
    @Pattern(regexp = "^[A-Za-z0-9\\-]*$", message = "Matrícula contém caracteres inválidos")
    private String matricula;

    @Size(max = 100)
    private String curso;

    @Pattern(regexp = "^(\\+?[0-9\\s\\-().]{7,20})?$", message = "Telefone inválido")
    private String telefone;

    public String getNome()                      { return nome; }
    public void   setNome(String nome)           { this.nome = nome; }
    public String getEmail()                     { return email; }
    public void   setEmail(String email)         { this.email = email; }
    public String getSenha()                     { return senha; }
    public void   setSenha(String senha)         { this.senha = senha; }
    public String getFuncao()                    { return funcao; }
    public void   setFuncao(String funcao)       { this.funcao = funcao; }
    public String getMatricula()                 { return matricula; }
    public void   setMatricula(String m)         { this.matricula = m; }
    public String getCurso()                     { return curso; }
    public void   setCurso(String curso)         { this.curso = curso; }
    public String getTelefone()                  { return telefone; }
    public void   setTelefone(String telefone)   { this.telefone = telefone; }
}
