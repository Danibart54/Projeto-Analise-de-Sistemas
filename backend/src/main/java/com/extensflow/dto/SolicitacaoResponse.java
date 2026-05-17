package com.extensflow.dto;

import com.extensflow.model.StatusSolicitacao;
import java.time.LocalDateTime;

public class SolicitacaoResponse {
    private Long id;
    private String titulo;
    private String descricao;
    private StatusSolicitacao status;
    private LocalDateTime dataEnvio;
    private Double pontuacaoTotal;
    private String nomeAluno;
    private Long alunoId;
    private boolean temFormulario;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public StatusSolicitacao getStatus() { return status; }
    public void setStatus(StatusSolicitacao status) { this.status = status; }
    public LocalDateTime getDataEnvio() { return dataEnvio; }
    public void setDataEnvio(LocalDateTime d) { this.dataEnvio = d; }
    public Double getPontuacaoTotal() { return pontuacaoTotal; }
    public void setPontuacaoTotal(Double p) { this.pontuacaoTotal = p; }
    public String getNomeAluno() { return nomeAluno; }
    public void setNomeAluno(String n) { this.nomeAluno = n; }
    public Long getAlunoId() { return alunoId; }
    public void setAlunoId(Long a) { this.alunoId = a; }
    public boolean isTemFormulario() { return temFormulario; }
    public void setTemFormulario(boolean t) { this.temFormulario = t; }
}
