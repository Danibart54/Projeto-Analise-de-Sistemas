package com.extensflow.model;

import java.time.LocalDateTime;

/** Documento embutido dentro de Solicitacao — não tem coleção própria no MongoDB. */
public class Formulario {

    private String titulo;
    private String descricao;
    private String objetivos;
    private String metodologia;
    private String resultadosEsperados;
    private String publicoAlvo;
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public String        getTitulo()                       { return titulo; }
    public void          setTitulo(String v)               { this.titulo = v; }
    public String        getDescricao()                    { return descricao; }
    public void          setDescricao(String v)            { this.descricao = v; }
    public String        getObjetivos()                    { return objetivos; }
    public void          setObjetivos(String v)            { this.objetivos = v; }
    public String        getMetodologia()                  { return metodologia; }
    public void          setMetodologia(String v)          { this.metodologia = v; }
    public String        getResultadosEsperados()          { return resultadosEsperados; }
    public void          setResultadosEsperados(String v)  { this.resultadosEsperados = v; }
    public String        getPublicoAlvo()                  { return publicoAlvo; }
    public void          setPublicoAlvo(String v)          { this.publicoAlvo = v; }
    public LocalDateTime getDataCriacao()                  { return dataCriacao; }
}
