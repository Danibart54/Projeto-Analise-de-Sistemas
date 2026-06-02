package com.extensflow.model;

/**
 * Funcao agora é apenas um valor de string embutido em UsuarioV2.funcoes.
 * Mantido como classe simples para compatibilidade com código existente.
 */
public class Funcao {

    private String nome;

    public Funcao() {}

    public Funcao(String nome) {
        this.nome = nome;
    }

    public String getNome()          { return nome; }
    public void setNome(String nome) { this.nome = nome; }
}
