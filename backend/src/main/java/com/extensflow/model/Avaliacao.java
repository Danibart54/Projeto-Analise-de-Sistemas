package com.extensflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "avaliacoes")
public class Avaliacao {

    @Id
    private String id;
    private Double nota;
    private String decisao;
    private LocalDateTime dataRegistro = LocalDateTime.now();

    @Indexed
    private String avaliadorId;
    private String etapaId;
    private String justificativa;

    public String  getId()                              { return id; }
    public Double  getNota()                            { return nota; }
    public void    setNota(Double nota)                 { this.nota = nota; }
    public String  getDecisao()                         { return decisao; }
    public void    setDecisao(String decisao)           { this.decisao = decisao; }
    public LocalDateTime getDataRegistro()              { return dataRegistro; }
    public String  getAvaliadorId()                     { return avaliadorId; }
    public void    setAvaliadorId(String id)            { this.avaliadorId = id; }
    public String  getEtapaId()                         { return etapaId; }
    public void    setEtapaId(String id)                { this.etapaId = id; }
    public String  getJustificativa()                   { return justificativa; }
    public void    setJustificativa(String j)           { this.justificativa = j; }
}
