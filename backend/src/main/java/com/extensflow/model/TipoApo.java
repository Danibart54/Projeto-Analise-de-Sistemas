package com.extensflow.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "tipos_apo")
public class TipoApo {

    @Id
    private String id;

    @NotBlank
    private String nome;
    private String descricao;
    private Integer creditos      = 1;
    private Integer limiteCreditos;
    private boolean obrigatoria   = false;
    private String anoRegra;
    private String aplicavelPara;
    private boolean ativo         = true;

    public String  getId()                        { return id; }
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
