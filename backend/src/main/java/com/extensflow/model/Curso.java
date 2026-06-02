package com.extensflow.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 150)
    private String nome;

    @Column(length = 20)
    private String nivel; // "MESTRADO" | "DOUTORADO" | "GRADUACAO"

    @Column(name = "creditos_necessarios")
    private Integer creditosNecessarios;

    @Column(nullable = false)
    private boolean ativo = true;

    public Long    getId()                             { return id; }
    public String  getNome()                           { return nome; }
    public void    setNome(String nome)                { this.nome = nome; }
    public String  getNivel()                          { return nivel; }
    public void    setNivel(String nivel)              { this.nivel = nivel; }
    public Integer getCreditosNecessarios()            { return creditosNecessarios; }
    public void    setCreditosNecessarios(Integer c)   { this.creditosNecessarios = c; }
    public boolean isAtivo()                           { return ativo; }
    public void    setAtivo(boolean ativo)             { this.ativo = ativo; }
}
