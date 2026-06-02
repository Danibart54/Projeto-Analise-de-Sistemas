package com.extensflow.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "usuarios_legado")
public class Orientador extends Usuario {

    private String areaAtuacao;
    private String titulacao;

    public String getAreaAtuacao()                      { return areaAtuacao; }
    public void   setAreaAtuacao(String areaAtuacao)    { this.areaAtuacao = areaAtuacao; }
    public String getTitulacao()                        { return titulacao; }
    public void   setTitulacao(String titulacao)        { this.titulacao = titulacao; }
}
