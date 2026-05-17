package com.extensflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class StatusRequest {

    @NotBlank(message = "Status é obrigatório")
    @Pattern(
        regexp = "^(ENVIADA_PARA_ANALISE|EM_AVALIACAO|APROVADA|REPROVADA|CONCLUIDA|CANCELADA)$",
        message = "Status inválido"
    )
    private String status;

    public String getStatus()               { return status; }
    public void   setStatus(String status)  { this.status = status; }
}
