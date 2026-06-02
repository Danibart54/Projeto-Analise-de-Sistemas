package com.extensflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notificacoes")
public class Notificacao {

    @Id
    private String id;
    private String tipo;
    private String mensagem;
    private LocalDateTime dataEnvio = LocalDateTime.now();
    private boolean lida = false;

    @Indexed
    private String destinatarioId;
    private String solicitacaoId;

    public String  getId()                              { return id; }
    public String  getTipo()                            { return tipo; }
    public void    setTipo(String tipo)                 { this.tipo = tipo; }
    public String  getMensagem()                        { return mensagem; }
    public void    setMensagem(String mensagem)         { this.mensagem = mensagem; }
    public LocalDateTime getDataEnvio()                 { return dataEnvio; }
    public boolean isLida()                             { return lida; }
    public void    setLida(boolean lida)                { this.lida = lida; }
    public String  getDestinatarioId()                  { return destinatarioId; }
    public void    setDestinatarioId(String id)         { this.destinatarioId = id; }
    public String  getSolicitacaoId()                   { return solicitacaoId; }
    public void    setSolicitacaoId(String id)          { this.solicitacaoId = id; }
}
