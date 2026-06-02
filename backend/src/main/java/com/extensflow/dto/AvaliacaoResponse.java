package com.extensflow.dto;

import com.extensflow.model.Avaliacao;
import java.time.LocalDateTime;

/**
 * DTO de saída para Avaliacao — expõe apenas dados necessários,
 * sem serializar entidades completas (Usuario, EtapaAvaliacao, etc).
 */
public class AvaliacaoResponse {
    private Long          id;
    private Double        nota;
    private String        decisao;
    private LocalDateTime dataRegistro;
    private String        nomeAvaliador;
    private Long          solicitacaoId;
    private String        justificativa;

    private AvaliacaoResponse() {}

    public static AvaliacaoResponse de(Avaliacao a, Long solicitacaoId) {
        AvaliacaoResponse r = new AvaliacaoResponse();
        r.id           = a.getId();
        r.nota         = a.getNota();
        r.decisao      = a.getDecisao();
        r.dataRegistro = a.getDataRegistro();
        r.nomeAvaliador = a.getAvaliador() != null ? a.getAvaliador().getNome() : null;
        r.solicitacaoId = solicitacaoId;
        r.justificativa = a.getJustificativa() != null ? a.getJustificativa().getTexto() : null;
        return r;
    }

    public Long          getId()           { return id; }
    public Double        getNota()         { return nota; }
    public String        getDecisao()      { return decisao; }
    public LocalDateTime getDataRegistro() { return dataRegistro; }
    public String        getNomeAvaliador(){ return nomeAvaliador; }
    public Long          getSolicitacaoId(){ return solicitacaoId; }
    public String        getJustificativa(){ return justificativa; }
}
