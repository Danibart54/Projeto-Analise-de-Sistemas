package com.extensflow.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class AvaliacaoRequest {

    @NotNull(message = "Nota é obrigatória")
    @Min(value = 0,  message = "Nota mínima é 0")
    @Max(value = 10, message = "Nota máxima é 10")
    private Double nota;

    // Whitelist de valores permitidos — rejeita qualquer outro texto
    @NotBlank(message = "Decisão é obrigatória")
    @Pattern(
        regexp = "^(APROVADA|REPROVADA|EM_AVALIACAO)$",
        message = "Decisão deve ser APROVADA, REPROVADA ou EM_AVALIACAO"
    )
    private String decisao;

    @Size(max = 3000, message = "Justificativa deve ter no máximo 3000 caracteres")
    private String justificativa;

    // avaliadorId ignorado no backend (usa JWT) — mantido no DTO para compatibilidade
    private Long avaliadorId;

    private Long etapaId;

    public Double getNota()                            { return nota; }
    public void   setNota(Double nota)                 { this.nota = nota; }
    public String getDecisao()                         { return decisao; }
    public void   setDecisao(String decisao)           { this.decisao = decisao; }
    public String getJustificativa()                   { return justificativa; }
    public void   setJustificativa(String j)           { this.justificativa = j; }
    public Long   getAvaliadorId()                     { return avaliadorId; }
    public void   setAvaliadorId(Long avaliadorId)     { this.avaliadorId = avaliadorId; }
    public Long   getEtapaId()                         { return etapaId; }
    public void   setEtapaId(Long etapaId)             { this.etapaId = etapaId; }
}
