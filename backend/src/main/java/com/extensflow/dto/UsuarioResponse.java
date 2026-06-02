package com.extensflow.dto;

import com.extensflow.model.*;

/**
 * DTO de saída para usuário — nunca expõe o campo senha.
 */
public class UsuarioResponse {
    private Long   id;
    private String nome;
    private String email;
    private String tipoUsuario;
    private boolean ativo;
    // Campos específicos por tipo (null quando não se aplica)
    private String matricula;
    private String curso;
    private String areaAtuacao;
    private String titulacao;
    private String especialidade;
    private String instituicao;

    private UsuarioResponse() {}

    /** Factory method — mapeia qualquer subtipo sem expor senha */
    public static UsuarioResponse de(Usuario u) {
        UsuarioResponse r = new UsuarioResponse();
        r.id          = u.getId();
        r.nome        = u.getNome();
        r.email       = u.getEmail();
        r.tipoUsuario = u.getTipoUsuario() != null ? u.getTipoUsuario().name() : null;
        r.ativo       = u.isAtivo();

        if (u instanceof Aluno a) {
            r.matricula = a.getMatricula();
            r.curso     = a.getCurso();
        } else if (u instanceof Orientador o) {
            r.areaAtuacao = o.getAreaAtuacao();
            r.titulacao   = o.getTitulacao();
        } else if (u instanceof MembroComissao m) {
            r.especialidade = m.getEspecialidade();
            r.instituicao   = m.getInstituicao();
        }
        return r;
    }

    public Long    getId()          { return id; }
    public String  getNome()        { return nome; }
    public String  getEmail()       { return email; }
    public String  getTipoUsuario() { return tipoUsuario; }
    public boolean isAtivo()        { return ativo; }
    public String  getMatricula()   { return matricula; }
    public String  getCurso()       { return curso; }
    public String  getAreaAtuacao() { return areaAtuacao; }
    public String  getTitulacao()   { return titulacao; }
    public String  getEspecialidade(){ return especialidade; }
    public String  getInstituicao() { return instituicao; }
}
