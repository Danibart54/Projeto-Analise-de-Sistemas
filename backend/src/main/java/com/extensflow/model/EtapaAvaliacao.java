package com.extensflow.model;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
@Document(collection = "etapas_avaliacao")
public class EtapaAvaliacao {
    @Id private String id;
    private String nome;
    private String descricao;
    private String status;
    private LocalDateTime dataInicio;
    private LocalDateTime dataFim;
    public String getId() { return id; }
    public String getNome() { return nome; }
    public void setNome(String n) { this.nome = n; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String d) { this.descricao = d; }
    public String getStatus() { return status; }
    public void setStatus(String s) { this.status = s; }
    public LocalDateTime getDataInicio() { return dataInicio; }
    public void setDataInicio(LocalDateTime d) { this.dataInicio = d; }
    public LocalDateTime getDataFim() { return dataFim; }
    public void setDataFim(LocalDateTime d) { this.dataFim = d; }
}
