package com.extensflow.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
@Document(collection = "anexos")
public class Anexo {
    @Id private String id;
    private String nomeOriginal;
    private String caminho;
    private String contentType;
    private Long tamanho;
    private LocalDateTime dataCriacao = LocalDateTime.now();
    private String solicitacaoId;
    public String getId() { return id; }
    public String getNomeOriginal() { return nomeOriginal; }
    public void setNomeOriginal(String n) { this.nomeOriginal = n; }
    public String getCaminho() { return caminho; }
    public void setCaminho(String c) { this.caminho = c; }
    public String getContentType() { return contentType; }
    public void setContentType(String c) { this.contentType = c; }
    public Long getTamanho() { return tamanho; }
    public void setTamanho(Long t) { this.tamanho = t; }
    public LocalDateTime getDataCriacao() { return dataCriacao; }
    public String getSolicitacaoId() { return solicitacaoId; }
    public void setSolicitacaoId(String id) { this.solicitacaoId = id; }
}
