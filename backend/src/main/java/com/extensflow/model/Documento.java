package com.extensflow.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
@Document(collection = "documentos")
public class Documento {
    @Id private String id;
    private String tipo;
    private String conteudo;
    private String status;
    private LocalDateTime dataCriacao = LocalDateTime.now();
    private LocalDateTime dataAssinatura;
    private String solicitacaoId;
    public String getId() { return id; }
    public String getTipo() { return tipo; }
    public void setTipo(String t) { this.tipo = t; }
    public String getConteudo() { return conteudo; }
    public void setConteudo(String c) { this.conteudo = c; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public LocalDateTime getDataAssinatura() { return dataAssinatura; }
    public void setDataAssinatura(LocalDateTime d) { this.dataAssinatura = d; }
    public String getSolicitacaoId() { return solicitacaoId; }
    public void setSolicitacaoId(String id) { this.solicitacaoId = id; }
}
