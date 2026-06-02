package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipo;
    private boolean assinado = false;
    private LocalDateTime dataAssinatura;
    private String assinadoPor;

    @ManyToOne
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    public Long getId() { return id; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public boolean isAssinado() { return assinado; }
    public void setAssinado(boolean assinado) { this.assinado = assinado; }
    public LocalDateTime getDataAssinatura() { return dataAssinatura; }
    public void setDataAssinatura(LocalDateTime dataAssinatura) { this.dataAssinatura = dataAssinatura; }
    public String getAssinadoPor() { return assinadoPor; }
    public void setAssinadoPor(String assinadoPor) { this.assinadoPor = assinadoPor; }
    public Solicitacao getSolicitacao() { return solicitacao; }
    public void setSolicitacao(Solicitacao solicitacao) { this.solicitacao = solicitacao; }
}
