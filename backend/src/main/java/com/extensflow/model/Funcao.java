package com.extensflow.model;

import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;

/**
 * Representa uma função (papel) que pode ser atribuída a um usuário.
 * Exemplos: SECRETARIO, COORDENADOR, COMISSAO_JULGADORA, ORIENTADOR, ALUNO.
 */
@Entity
@Table(name = "funcoes")
public class Funcao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String nome;

    @ManyToMany(mappedBy = "funcoes", fetch = FetchType.LAZY)
    private Set<UsuarioV2> usuarios = new HashSet<>();

    public Funcao() {}

    public Funcao(String nome) {
        this.nome = nome;
    }

    public Long getId()               { return id; }
    public String getNome()           { return nome; }
    public void setNome(String nome)  { this.nome = nome; }
    public Set<UsuarioV2> getUsuarios() { return usuarios; }
}
