package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "formularios")
public class Formulario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(length = 5000)
    private String descricao;

    @Column(length = 3000)
    private String objetivos;

    @Column(length = 3000)
    private String metodologia;

    @Column(name = "resultados_esperados", length = 3000)
    private String resultadosEsperados;

    @Column(name = "publico_alvo", length = 500)
    private String publicoAlvo;

    @Column(name = "data_criacao")
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public Long          getId()                         { return id; }
    public String        getTitulo()                     { return titulo; }
    public void          setTitulo(String v)             { this.titulo = v; }
    public String        getDescricao()                  { return descricao; }
    public void          setDescricao(String v)          { this.descricao = v; }
    public String        getObjetivos()                  { return objetivos; }
    public void          setObjetivos(String v)          { this.objetivos = v; }
    public String        getMetodologia()                { return metodologia; }
    public void          setMetodologia(String v)        { this.metodologia = v; }
    public String        getResultadosEsperados()        { return resultadosEsperados; }
    public void          setResultadosEsperados(String v){ this.resultadosEsperados = v; }
    public String        getPublicoAlvo()                { return publicoAlvo; }
    public void          setPublicoAlvo(String v)        { this.publicoAlvo = v; }
    public LocalDateTime getDataCriacao()                { return dataCriacao; }
}
