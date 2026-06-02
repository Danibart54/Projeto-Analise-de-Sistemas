package com.extensflow.model;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "usuarios_legado")
public class Aluno extends Usuario {

    private String matricula;
    private String curso;

    public String getMatricula() { return matricula; }
    public void setMatricula(String matricula) { this.matricula = matricula; }
    public String getCurso()     { return curso; }
    public void setCurso(String curso) { this.curso = curso; }
}
