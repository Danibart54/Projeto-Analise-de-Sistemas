package com.extensflow.dto;

import com.extensflow.model.Funcao;
import com.extensflow.model.UsuarioV2;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class UsuarioV2Response {

    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String curso;
    private String setor;
    private boolean ativo;
    private boolean admin;
    private LocalDateTime dataCriacao;
    private List<String> funcoes;

    private UsuarioV2Response() {}

    public static UsuarioV2Response de(UsuarioV2 u) {
        UsuarioV2Response r = new UsuarioV2Response();
        r.id = u.getId();
        r.nome = u.getNome();
        r.email = u.getEmail();
        r.telefone = u.getTelefone();
        r.curso = u.getCurso();
        r.setor = u.getSetor();
        r.ativo = u.isAtivo();
        r.admin = u.isAdmin();
        r.dataCriacao = u.getDataCriacao();
        r.funcoes = u.getFuncoes().stream()
                .map(Funcao::getNome)
                .sorted()
                .collect(Collectors.toList());
        return r;
    }

    public Long getId()                  { return id; }
    public String getNome()              { return nome; }
    public String getEmail()             { return email; }
    public String getTelefone()          { return telefone; }
    public String getCurso()             { return curso; }
    public String getSetor()             { return setor; }
    public boolean isAtivo()             { return ativo; }
    public boolean isAdmin()             { return admin; }
    public LocalDateTime getDataCriacao(){ return dataCriacao; }
    public List<String> getFuncoes()     { return funcoes; }
}
