package com.extensflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** Payload enviado pelo coordenador ao votar em uma solicitação. */
public class VotoRequest {

    @NotBlank(message = "Voto é obrigatório")
    @Pattern(regexp = "APROVADO|RECUSADO", message = "Voto deve ser APROVADO ou RECUSADO")
    private String voto;

    public String getVoto()           { return voto; }
    public void   setVoto(String voto){ this.voto = voto; }
}
