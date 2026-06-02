package com.extensflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "tipos_apo")
public class TipoApo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 200)
    private String nome;

    @Column(length = 1000)
    private String descricao;

    @Column(nullable = false)
    private Integer creditos = 1;

    @Column(name = "limite_creditos")
    private Integer limiteCreditos;

    @Column(nullable = false)
    private boolean obrigatoria = false;

    @Column(name = "ano_regra", length = 10)
    private String anoRegra; // "ANTES_2026" | "A_PARTIR_2026" | "AMBOS"

    @Column(name = "aplicavel_para", length = 50)
    private String aplicavelPara; // "MESTRADO" | "DOUTORADO" | "AMBOS"

    @Column(nullable = false)
    private boolean ativo = true;

    public Long    getId()                        { return id; }
    public String  getNome()                      { return nome; }
    public void    setNome(String nome)           { this.nome = nome; }
    public String  getDescricao()                 { return descricao; }
    public void    setDescricao(String d)         { this.descricao = d; }
    public Integer getCreditos()                  { return creditos; }
    public void    setCreditos(Integer c)         { this.creditos = c; }
    public Integer getLimiteCreditos()            { return limiteCreditos; }
    public void    setLimiteCreditos(Integer l)   { this.limiteCreditos = l; }
    public boolean isObrigatoria()                { return obrigatoria; }
    public void    setObrigatoria(boolean o)      { this.obrigatoria = o; }
    public String  getAnoRegra()                  { return anoRegra; }
    public void    setAnoRegra(String a)          { this.anoRegra = a; }
    public String  getAplicavelPara()             { return aplicavelPara; }
    public void    setAplicavelPara(String a)     { this.aplicavelPara = a; }
    public boolean isAtivo()                      { return ativo; }
    public void    setAtivo(boolean ativo)        { this.ativo = ativo; }
}
