package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "historico_apo")
public class HistoricoApo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id", nullable = false)
    private Solicitacao solicitacao;

    @Column(name = "usuario_id")
    private Long usuarioId;

    @Column(name = "nome_usuario", length = 150)
    private String nomeUsuario;

    @Column(name = "perfil_usuario", length = 50)
    private String perfilUsuario;

    @Column(length = 50)
    private String acao; // CRIADA, ENVIADA, APROVADA, DEVOLVIDA, ABSTENCAO, etc.

    @Column(name = "status_anterior", length = 50)
    private String statusAnterior;

    @Column(name = "status_novo", length = 50)
    private String statusNovo;

    @Column(length = 2000)
    private String justificativa;

    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    public Long          getId()                         { return id; }
    public Solicitacao   getSolicitacao()                { return solicitacao; }
    public void          setSolicitacao(Solicitacao s)   { this.solicitacao = s; }
    public Long          getUsuarioId()                  { return usuarioId; }
    public void          setUsuarioId(Long id)           { this.usuarioId = id; }
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
