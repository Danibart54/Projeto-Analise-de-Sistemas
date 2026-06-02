package com.extensflow.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "apos")
public class Solicitacao {

    @Id
    private String id;

    private String titulo;
    private String descricao;
    private LocalDateTime dataEnvio;
    private LocalDateTime dataAtividade;
    private LocalDateTime dataCriacao     = LocalDateTime.now();
    private LocalDateTime dataAtualizacao = LocalDateTime.now();

    private Double  pontuacaoTotal;
    private Integer creditosPrevistos;
    private Integer creditosAprovados;

    private String tipoApoId;
    private String nomeTipoApo;
    private String responsavelAtual;
    private String justificativaAtual;

    @Indexed
    private String alunoId;
    private String nomeAluno;

    @Indexed
    private String orientadorId;
    private String nomeOrientador;

    private StatusSolicitacao status = StatusSolicitacao.RASCUNHO;

    private Formulario        formulario;
    private List<HistoricoApo> historico = new ArrayList<>();

    // ── Getters & Setters ──────────────────────────────────────────────────────

    public String         getId()                              { return id; }
    public String         getTitulo()                          { return titulo; }
    public void           setTitulo(String t)                  { this.titulo = t; touch(); }
    public String         getDescricao()                       { return descricao; }
    public void           setDescricao(String d)               { this.descricao = d; touch(); }
    public LocalDateTime  getDataEnvio()                       { return dataEnvio; }
    public void           setDataEnvio(LocalDateTime d)        { this.dataEnvio = d; }
    public LocalDateTime  getDataAtividade()                   { return dataAtividade; }
    public void           setDataAtividade(LocalDateTime d)    { this.dataAtividade = d; touch(); }
    public LocalDateTime  getDataCriacao()                     { return dataCriacao; }
    public LocalDateTime  getDataAtualizacao()                 { return dataAtualizacao; }
    public Double         getPontuacaoTotal()                  { return pontuacaoTotal; }
    public void           setPontuacaoTotal(Double p)          { this.pontuacaoTotal = p; touch(); }
    public Integer        getCreditosPrevistos()               { return creditosPrevistos; }
    public void           setCreditosPrevistos(Integer c)      { this.creditosPrevistos = c; touch(); }
    public Integer        getCreditosAprovados()               { return creditosAprovados; }
    public void           setCreditosAprovados(Integer c)      { this.creditosAprovados = c; touch(); }
    public String         getTipoApoId()                       { return tipoApoId; }
    public void           setTipoApoId(String id)              { this.tipoApoId = id; touch(); }
    public String         getNomeTipoApo()                     { return nomeTipoApo; }
    public void           setNomeTipoApo(String n)             { this.nomeTipoApo = n; touch(); }
    public String         getResponsavelAtual()                { return responsavelAtual; }
    public void           setResponsavelAtual(String r)        { this.responsavelAtual = r; touch(); }
    public String         getJustificativaAtual()              { return justificativaAtual; }
    public void           setJustificativaAtual(String j)      { this.justificativaAtual = j; touch(); }
    public String         getAlunoId()                         { return alunoId; }
    public void           setAlunoId(String id)                { this.alunoId = id; }
    public String         getNomeAluno()                       { return nomeAluno; }
    public void           setNomeAluno(String n)               { this.nomeAluno = n; }
    public String         getOrientadorId()                    { return orientadorId; }
    public void           setOrientadorId(String id)           { this.orientadorId = id; }
    public String         getNomeOrientador()                  { return nomeOrientador; }
    public void           setNomeOrientador(String n)          { this.nomeOrientador = n; }
    public StatusSolicitacao getStatus()                       { return status; }
    public void           setStatus(StatusSolicitacao s)       { this.status = s; touch(); }
    public Formulario     getFormulario()                      { return formulario; }
    public void           setFormulario(Formulario f)          { this.formulario = f; }
    public List<HistoricoApo> getHistorico()                   { return historico; }
    public void           setHistorico(List<HistoricoApo> h)   { this.historico = h; }

    private void touch() { this.dataAtualizacao = LocalDateTime.now(); }
}
