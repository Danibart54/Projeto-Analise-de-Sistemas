package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "avaliacoes")
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Double nota;

    // Limitado a 20 chars — apenas APROVADA, REPROVADA ou EM_AVALIACAO
    @Column(nullable = false, length = 20)
    private String decisao;

    @Column(name = "data_registro", nullable = false)
    private LocalDateTime dataRegistro = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avaliador_id", nullable = false)
    private Usuario avaliador;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "justificativa_id")
    private Justificativa justificativa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "etapa_id")
    private EtapaAvaliacao etapa;

    public Long getId()                                    { return id; }
    public Double getNota()                                { return nota; }
    public void setNota(Double nota)                       { this.nota = nota; }
    public String getDecisao()                             { return decisao; }
    public void setDecisao(String decisao)                 { this.decisao = decisao; }
    public LocalDateTime getDataRegistro()                 { return dataRegistro; }
    public Usuario getAvaliador()                          { return avaliador; }
    public void setAvaliador(Usuario avaliador)            { this.avaliador = avaliador; }
    public Justificativa getJustificativa()                { return justificativa; }
    public void setJustificativa(Justificativa j)          { this.justificativa = j; }
    public EtapaAvaliacao getEtapa()                       { return etapa; }
    public void setEtapa(EtapaAvaliacao etapa)             { this.etapa = etapa; }
}
