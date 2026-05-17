package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String tipo;

    @Column(nullable = false, length = 1000)
    private String mensagem;

    @Column(name = "data_envio", nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Column(nullable = false)
    private boolean lida = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destinatario_id", nullable = false)
    private Usuario destinatario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitacao_id")
    private Solicitacao solicitacao;

    public Long getId()                                        { return id; }
    public String getTipo()                                    { return tipo; }
    public void setTipo(String tipo)                           { this.tipo = tipo; }
    public String getMensagem()                                { return mensagem; }
    public void setMensagem(String mensagem)                   { this.mensagem = mensagem; }
    public LocalDateTime getDataEnvio()                        { return dataEnvio; }
    public boolean isLida()                                    { return lida; }
    public void setLida(boolean lida)                          { this.lida = lida; }
    public Usuario getDestinatario()                           { return destinatario; }
    public void setDestinatario(Usuario destinatario)          { this.destinatario = destinatario; }
    public Solicitacao getSolicitacao()                        { return solicitacao; }
    public void setSolicitacao(Solicitacao solicitacao)        { this.solicitacao = solicitacao; }
}
