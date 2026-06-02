package com.extensflow.dto;

import com.extensflow.model.AprovacaoSolicitacao;
import java.time.LocalDateTime;

public class AprovacaoSolicitacaoResponse {

    private Long id;
    private Long solicitacaoId;
    private Long coordenadorId;
    private String nomeCoordenador;
    private String voto;               // "APROVADO" | "RECUSADO"
    private LocalDateTime dataVoto;
    private int totalVotos;
    private int totalAprovados;
    private int totalRecusados;
    private boolean resultadoDefinido; // true quando 2+ votos iguais

    private AprovacaoSolicitacaoResponse() {}

    public static AprovacaoSolicitacaoResponse de(AprovacaoSolicitacao a,
                                                   int totalVotos,
                                                   int totalAprovados,
                                                   int totalRecusados) {
        AprovacaoSolicitacaoResponse r = new AprovacaoSolicitacaoResponse();
        r.id              = a.getId();
        r.solicitacaoId   = a.getSolicitacao().getId();
        r.coordenadorId   = a.getCoordenador().getId();
        r.nomeCoordenador = a.getCoordenador().getNome();
        r.voto            = a.getVoto() != null ? a.getVoto().name() : null;
        r.dataVoto        = a.getDataAprovacao();
        r.totalVotos      = totalVotos;
        r.totalAprovados  = totalAprovados;
        r.totalRecusados  = totalRecusados;
        r.resultadoDefinido = totalAprovados >= 2 || totalRecusados >= 2;
        return r;
    }

    /** Compat retroativa — sem contagens separadas */
    public static AprovacaoSolicitacaoResponse de(AprovacaoSolicitacao a, int total) {
        return de(a, total, total, 0);
    }

    public Long getId()                     { return id; }
    public Long getSolicitacaoId()          { return solicitacaoId; }
    public Long getCoordenadorId()          { return coordenadorId; }
    public String getNomeCoordenador()      { return nomeCoordenador; }
    public String getVoto()                 { return voto; }
    public LocalDateTime getDataVoto()      { return dataVoto; }
    public int getTotalVotos()              { return totalVotos; }
    public int getTotalAprovados()          { return totalAprovados; }
    public int getTotalRecusados()          { return totalRecusados; }
    public boolean isResultadoDefinido()    { return resultadoDefinido; }

    // Compat legada
    public LocalDateTime getDataAprovacao() { return dataVoto; }
    public int getTotalAprovacoes()         { return totalVotos; }
    public boolean isSolicitacaoAprovada()  { return totalAprovados >= 2; }
}
