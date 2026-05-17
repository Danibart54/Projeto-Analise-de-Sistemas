package com.extensflow.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ResultadoFinalRequest {

    @NotBlank(message = "Status é obrigatório")
    @Pattern(
        regexp = "^(APROVADA|REPROVADA)$",
        message = "Status do resultado final deve ser APROVADA ou REPROVADA"
    )
    private String status;

    @DecimalMin(value = "0.0", message = "Pontuação mínima é 0.0")
    @DecimalMax(value = "10.0", message = "Pontuação máxima é 10.0")
    private Double pontuacao;

    public String getStatus()               { return status; }
    public void   setStatus(String status)  { this.status = status; }
    public Double getPontuacao()            { return pontuacao; }
    public void   setPontuacao(Double p)    { this.pontuacao = p; }
}
