package com.extensflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/** Voto de coordenador — documento próprio para compatibilidade com o fluxo legado. */
@Document(collection = "aprovacoes")
public class AprovacaoSolicitacao {

    public enum Voto { APROVADO, RECUSADO }

    @Id
    private String id;

    private String solicitacaoId;
    private String coordenadorId;
    private String nomeCoordenador;
    private Voto   voto;
    private LocalDateTime dataAprovacao = LocalDateTime.now();
    private LocalDateTime dataVoto;

    public AprovacaoSolicitacao() {}

    public AprovacaoSolicitacao(String solicitacaoId, String coordenadorId, Voto voto) {
        this.solicitacaoId = solicitacaoId;
        this.coordenadorId = coordenadorId;
        this.voto          = voto;
        this.dataAprovacao = LocalDateTime.now();
        this.dataVoto      = LocalDateTime.now();
    }

    public String  getId()                              { return id; }
    public String  getSolicitacaoId()                   { return solicitacaoId; }
    public void    setSolicitacaoId(String id)          { this.solicitacaoId = id; }
    public String  getCoordenadorId()                   { return coordenadorId; }
    public void    setCoordenadorId(String id)          { this.coordenadorId = id; }
    public String  getNomeCoordenador()                 { return nomeCoordenador; }
    public void    setNomeCoordenador(String n)         { this.nomeCoordenador = n; }
    public Voto    getVoto()                            { return voto; }
    public void    setVoto(Voto voto)                   { this.voto = voto; }
    public LocalDateTime getDataAprovacao()             { return dataAprovacao; }
    public LocalDateTime getDataVoto()                  { return dataVoto; }
    public void    setDataVoto(LocalDateTime d)         { this.dataVoto = d; }
}
