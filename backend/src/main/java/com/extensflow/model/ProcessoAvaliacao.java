package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "processos_avaliacao")
public class ProcessoAvaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String etapaAtual;
    private String status = "EM_ANDAMENTO";
    private LocalDateTime dataInicio = LocalDateTime.now();
    private LocalDateTime dataFim;

    @OneToOne
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    @OneToMany(mappedBy = "processo", cascade = CascadeType.ALL)
    @OrderBy("ordem ASC")
    private List<EtapaAvaliacao> etapas = new ArrayList<>();

    public Long getId() { return id; }
    public String getEtapaAtual() { return etapaAtual; }
    public void setEtapaAtual(String etapaAtual) { this.etapaAtual = etapaAtual; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime dataFim) { this.dataFim = dataFim; }
    public Solicitacao getSolicitacao() { return solicitacao; }
    public void setSolicitacao(Solicitacao solicitacao) { this.solicitacao = solicitacao; }
    public List<EtapaAvaliacao> getEtapas() { return etapas; }
}
