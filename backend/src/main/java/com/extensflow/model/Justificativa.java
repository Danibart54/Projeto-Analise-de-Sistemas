package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "justificativas")
public class Justificativa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 3000, nullable = false)
    private String texto;

    private LocalDateTime data = LocalDateTime.now();

    public Justificativa() {}
    public Justificativa(String texto) { this.texto = texto; }

    public Long getId() { return id; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public LocalDateTime getData() { return data; }
}
