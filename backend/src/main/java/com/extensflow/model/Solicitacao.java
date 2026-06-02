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

    @Column(name = "data_atividade")
    private LocalDateTime dataAtividade;

    @Column(name = "data_criacao", nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    @Column(name = "data_atualizacao")
    private LocalDateTime dataAtualizacao = LocalDateTime.now();

    @Column(name = "pontuacao_total")
    private Double pontuacaoTotal;

    @Column(name = "creditos_previstos")
    private Integer creditosPrevistos;

    @Column(name = "creditos_aprovados")
    private Integer creditosAprovados;

    @Column(name = "tipo_apo_id")
    private Long tipoApoId;

    @Column(name = "nome_tipo_apo", length = 200)
    private String nomeTipoApo;

    @Column(name = "responsavel_atual", length = 50)
    private String responsavelAtual;

    @Column(name = "orientador_id")
    private Long orientadorId;

    @Column(name = "nome_orientador", length = 150)
    private String nomeOrientador;

    @Column(name = "justificativa_atual", length = 2000)
    private String justificativaAtual;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private StatusSolicitacao status = StatusSolicitacao.RASCUNHO;

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

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AprovacaoSolicitacao> aprovacoes = new ArrayList<>();

    @OneToMany(mappedBy = "solicitacao", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<HistoricoApo> historico = new ArrayList<>();

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long          getId()                                    { return id; }
    public String        getTitulo()                                { return titulo; }
    public void          setTitulo(String titulo)                   { this.titulo = titulo; touch(); }
    public String        getDescricao()                             { return descricao; }
    public void          setDescricao(String descricao)             { this.descricao = descricao; touch(); }
    public LocalDateTime getDataEnvio()                             { return dataEnvio; }
    public void          setDataEnvio(LocalDateTime d)              { this.dataEnvio = d; }
    public LocalDateTime getDataAtividade()                         { return dataAtividade; }
    public void          setDataAtividade(LocalDateTime d)          { this.dataAtividade = d; touch(); }
    public LocalDateTime getDataCriacao()                           { return dataCriacao; }
    public LocalDateTime getDataAtualizacao()                       { return dataAtualizacao; }
    public Double        getPontuacaoTotal()                        { return pontuacaoTotal; }
    public void          setPontuacaoTotal(Double p)                { this.pontuacaoTotal = p; touch(); }
    public Integer       getCreditosPrevistos()                     { return creditosPrevistos; }
    public void          setCreditosPrevistos(Integer c)            { this.creditosPrevistos = c; touch(); }
    public Integer       getCreditosAprovados()                     { return creditosAprovados; }
    public void          setCreditosAprovados(Integer c)            { this.creditosAprovados = c; touch(); }
    public Long          getTipoApoId()                             { return tipoApoId; }
    public void          setTipoApoId(Long id)                      { this.tipoApoId = id; touch(); }
    public String        getNomeTipoApo()                           { return nomeTipoApo; }
    public void          setNomeTipoApo(String n)                   { this.nomeTipoApo = n; touch(); }
    public String        getResponsavelAtual()                      { return responsavelAtual; }
    public void          setResponsavelAtual(String r)              { this.responsavelAtual = r; touch(); }
    public Long          getOrientadorId()                          { return orientadorId; }
    public void          setOrientadorId(Long id)                   { this.orientadorId = id; }
    public String        getNomeOrientador()                        { return nomeOrientador; }
    public void          setNomeOrientador(String n)                { this.nomeOrientador = n; }
    public String        getJustificativaAtual()                    { return justificativaAtual; }
    public void          setJustificativaAtual(String j)            { this.justificativaAtual = j; touch(); }
    public StatusSolicitacao getStatus()                            { return status; }
    public void          setStatus(StatusSolicitacao status)        { this.status = status; touch(); }
    public Aluno         getAluno()                                 { return aluno; }
    public void          setAluno(Aluno aluno)                      { this.aluno = aluno; }
    public Formulario    getFormulario()                            { return formulario; }
    public void          setFormulario(Formulario f)                { this.formulario = f; }
    public List<Anexo>   getAnexos()                                { return anexos; }
    public List<Documento> getDocumentos()                          { return documentos; }
    public List<Notificacao> getNotificacoes()                      { return notificacoes; }
    public ProcessoAvaliacao getProcesso()                          { return processo; }
    public void          setProcesso(ProcessoAvaliacao p)           { this.processo = p; }
    public List<AprovacaoSolicitacao> getAprovacoes()               { return aprovacoes; }
    public int           getTotalAprovacoes()                       { return aprovacoes != null ? aprovacoes.size() : 0; }
    public List<HistoricoApo> getHistorico()                        { return historico; }

    private void touch() { this.dataAtualizacao = LocalDateTime.now(); }
}
