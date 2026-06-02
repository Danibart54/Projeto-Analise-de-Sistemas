package com.extensflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FormularioRequest {

    @NotBlank(message = "Título do formulário é obrigatório")
    @Size(min = 5, max = 200, message = "Título deve ter entre 5 e 200 caracteres")
    private String titulo;

    @Size(max = 5000, message = "Descrição deve ter no máximo 5000 caracteres")
    private String descricao;

    @Size(max = 3000, message = "Objetivos devem ter no máximo 3000 caracteres")
    private String objetivos;

    @Size(max = 3000, message = "Metodologia deve ter no máximo 3000 caracteres")
    private String metodologia;

    @Size(max = 3000, message = "Resultados esperados devem ter no máximo 3000 caracteres")
    private String resultadosEsperados;

    @Size(max = 500, message = "Público-alvo deve ter no máximo 500 caracteres")
    private String publicoAlvo;

    public String getTitulo()                                    { return titulo; }
    public void   setTitulo(String t)                           { this.titulo = t; }
    public String getDescricao()                                 { return descricao; }
    public void   setDescricao(String d)                        { this.descricao = d; }
    public String getObjetivos()                                 { return objetivos; }
    public void   setObjetivos(String o)                        { this.objetivos = o; }
    public String getMetodologia()                               { return metodologia; }
    public void   setMetodologia(String m)                      { this.metodologia = m; }
    public String getResultadosEsperados()                       { return resultadosEsperados; }
    public void   setResultadosEsperados(String r)              { this.resultadosEsperados = r; }
    public String getPublicoAlvo()                               { return publicoAlvo; }
    public void   setPublicoAlvo(String p)                      { this.publicoAlvo = p; }
}
