package com.extensflow.model;

import java.time.LocalDateTime;

/** Documento embutido dentro de Solicitacao — não tem coleção própria no MongoDB. */
public class HistoricoApo {

    private String usuarioId;
    private String nomeUsuario;
    private String perfilUsuario;
    private String acao;
    private String statusAnterior;
    private String statusNovo;
    private String justificativa;
    private LocalDateTime data = LocalDateTime.now();

    public String        getUsuarioId()                  { return usuarioId; }
    public void          setUsuarioId(String id)         { this.usuarioId = id; }
    public String        getNomeUsuario()                { return nomeUsuario; }
    public void          setNomeUsuario(String n)        { this.nomeUsuario = n; }
    public String        getPerfilUsuario()              { return perfilUsuario; }
    public void          setPerfilUsuario(String p)      { this.perfilUsuario = p; }
    public String        getAcao()                       { return acao; }
    public void          setAcao(String acao)            { this.acao = acao; }
    public String        getStatusAnterior()             { return statusAnterior; }
    public void          setStatusAnterior(String s)     { this.statusAnterior = s; }
    public String        getStatusNovo()                 { return statusNovo; }
    public void          setStatusNovo(String s)         { this.statusNovo = s; }
    public String        getJustificativa()              { return justificativa; }
    public void          setJustificativa(String j)      { this.justificativa = j; }
    public LocalDateTime getData()                       { return data; }
    public void          setData(LocalDateTime d)        { this.data = d; }
}
