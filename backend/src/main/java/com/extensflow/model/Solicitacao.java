package com.extensflow.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "solicitacoes")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(length = 2000)
    private String descricao;

    private LocalDateTime dataEnvio;

    @Column(name = "pontuacao_total")
    private Double pontuacaoTotal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private StatusSolicitacao status = StatusSolicitacao.EM_PREENCHIMENTO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    private Aluno aluno;

    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "formulario_id")
    private Formulario formulario;

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Anexo> anexos = new ArrayList<>();

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Documento> documentos = new ArrayList<>();

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Notificacao> notificacoes = new ArrayList<>();

    @OneToOne(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private ProcessoAvaliacao processo;

    public Long getId()                                    { return id; }
    public String getTitulo()                              { return titulo; }
    public void setTitulo(String titulo)                   { this.titulo = titulo; }
    public String getDescricao()                           { return descricao; }
    public void setDescricao(String descricao)             { this.descricao = descricao; }
    public LocalDateTime getDataEnvio()                    { return dataEnvio; }
    public void setDataEnvio(LocalDateTime d)              { this.dataEnvio = d; }
    public Double getPontuacaoTotal()                      { return pontuacaoTotal; }
    public void setPontuacaoTotal(Double p)                { this.pontuacaoTotal = p; }
    public StatusSolicitacao getStatus()                   { return status; }
    public void setStatus(StatusSolicitacao status)        { this.status = status; }
    public Aluno getAluno()                                { return aluno; }
    public void setAluno(Aluno aluno)                      { this.aluno = aluno; }
    public Formulario getFormulario()                      { return formulario; }
    public void setFormulario(Formulario f)                { this.formulario = f; }
    public List<Anexo> getAnexos()                         { return anexos; }
    public List<Documento> getDocumentos()                 { return documentos; }
    public List<Notificacao> getNotificacoes()             { return notificacoes; }
    public ProcessoAvaliacao getProcesso()                 { return processo; }
    public void setProcesso(ProcessoAvaliacao p)           { this.processo = p; }
}
