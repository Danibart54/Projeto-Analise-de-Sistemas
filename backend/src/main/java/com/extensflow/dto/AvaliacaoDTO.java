package com.extensflow.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class AvaliacaoDTO {

    @NotNull(message = "Nota é obrigatória")
    @DecimalMin(value = "0.0", message = "Nota mínima é 0")
    @DecimalMax(value = "10.0", message = "Nota máxima é 10")
    private Double nota;

    @NotNull(message = "Decisão é obrigatória")
    private String decisao;

    private String justificativa;

    @NotNull(message = "Avaliador é obrigatório")
    private Long avaliadorId;

    private Long etapaId;

    public Double getNota() { return nota; }
    public void setNota(Double nota) { this.nota = nota; }

    public String getDecisao() { return decisao; }
    public void setDecisao(String decisao) { this.decisao = decisao; }

    public String getJustificativa() { return justificativa; }
    public void setJustificativa(String justificativa) { this.justificativa = justificativa; }

    public Long getAvaliadorId() { return avaliadorId; }
    public void setAvaliadorId(Long avaliadorId) { this.avaliadorId = avaliadorId; }

    public Long getEtapaId() { return etapaId; }
    public void setEtapaId(Long etapaId) { this.etapaId = etapaId; }
}
