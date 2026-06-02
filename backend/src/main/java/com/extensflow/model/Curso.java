package com.extensflow.model;

import jakarta.validation.constraints.NotBlank;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "cursos")
public class Curso {

    @Id
    private String id;

    @NotBlank
    private String nome;
    private String nivel;
    private Integer creditosNecessarios;
    private boolean ativo = true;

    public String  getId()                           { return id; }
    public String  getNome()                         { return nome; }
    public void    setNome(String nome)              { this.nome = nome; }
    public String  getNivel()                        { return nivel; }
    public void    setNivel(String nivel)            { this.nivel = nivel; }
    public Integer getCreditosNecessarios()          { return creditosNecessarios; }
    public void    setCreditosNecessarios(Integer c) { this.creditosNecessarios = c; }
    public boolean isAtivo()                         { return ativo; }
    public void    setAtivo(boolean ativo)           { this.ativo = ativo; }
}
