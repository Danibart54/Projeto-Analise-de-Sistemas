package com.extensflow.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

/** Payload recebido quando o admin atribui ou substitui as funções de um usuário. */
public class AtribuirFuncoesRequest {

    @NotNull(message = "Lista de funções não pode ser nula (envie [] para remover todas)")
    private List<String> funcoes;

    /** Quando true, promove o usuário a admin. Quando false, rebaixa. */
    private Boolean admin;

    public List<String> getFuncoes()            { return funcoes; }
    public void setFuncoes(List<String> f)      { this.funcoes = f; }
    public Boolean getAdmin()                   { return admin; }
    public void setAdmin(Boolean admin)         { this.admin = admin; }
}
