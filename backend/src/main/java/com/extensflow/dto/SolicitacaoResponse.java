package com.extensflow.dto;

import com.extensflow.model.StatusSolicitacao;
import java.time.LocalDateTime;

public class SolicitacaoResponse {

    private Long   id;        // hash numérico para compatibilidade com frontend legado
    private String idStr;     // ID real do MongoDB (ObjectId string)
    private String titulo;
    private String descricao;
    private StatusSolicitacao status;
    private LocalDateTime dataEnvio;
    private LocalDateTime dataAtividade;
    private LocalDateTime dataCriacao;
    private LocalDateTime dataAtualizacao;
    private Double  pontuacaoTotal;
    private boolean temFormulario;

    private String nomeAluno;
    private Long   alunoId;
    private String alunoIdStr;

    private Integer creditosPrevistos;
    private Integer creditosAprovados;
    private String  tipoApoId;
    private String  nomeTipoApo;
    private String  responsavelAtual;
    private String  justificativaAtual;

    private String orientadorId;
    private String nomeOrientador;

    private int totalAprovacoes;
    private int aprovacoesRestantes;

    public Long    getId()                              { return id; }
    public void    setId(Long id)                       { this.id = id; }
    public String  getIdStr()                           { return idStr; }
    public void    setIdStr(String idStr)               { this.idStr = idStr; }
    public String  getTitulo()                          { return titulo; }
    public void    setTitulo(String titulo)             { this.titulo = titulo; }
    public String  getDescricao()                       { return descricao; }
    public void    setDescricao(String descricao)       { this.descricao = descricao; }
    public StatusSolicitacao getStatus()                { return status; }
    public void    setStatus(StatusSolicitacao status)  { this.status = status; }
    public LocalDateTime getDataEnvio()                 { return dataEnvio; }
    public void    setDataEnvio(LocalDateTime d)        { this.dataEnvio = d; }
    public LocalDateTime getDataAtividade()             { return dataAtividade; }
    public void    setDataAtividade(LocalDateTime d)    { this.dataAtividade = d; }
    public LocalDateTime getDataCriacao()               { return dataCriacao; }
    public void    setDataCriacao(LocalDateTime d)      { this.dataCriacao = d; }
    public LocalDateTime getDataAtualizacao()           { return dataAtualizacao; }
    public void    setDataAtualizacao(LocalDateTime d)  { this.dataAtualizacao = d; }
    public Double  getPontuacaoTotal()                  { return pontuacaoTotal; }
    public void    setPontuacaoTotal(Double p)          { this.pontuacaoTotal = p; }
    public boolean isTemFormulario()                    { return temFormulario; }
    public void    setTemFormulario(boolean t)          { this.temFormulario = t; }
    public String  getNomeAluno()                       { return nomeAluno; }
    public void    setNomeAluno(String n)               { this.nomeAluno = n; }
    public Long    getAlunoId()                         { return alunoId; }
    public void    setAlunoId(Long id)                  { this.alunoId = id; }
    public String  getAlunoIdStr()                      { return alunoIdStr; }
    public void    setAlunoIdStr(String id)             { this.alunoIdStr = id; }
    public Integer getCreditosPrevistos()               { return creditosPrevistos; }
    public void    setCreditosPrevistos(Integer c)      { this.creditosPrevistos = c; }
    public Integer getCreditosAprovados()               { return creditosAprovados; }
    public void    setCreditosAprovados(Integer c)      { this.creditosAprovados = c; }
    public String  getTipoApoId()                       { return tipoApoId; }
    public void    setTipoApoId(String id)              { this.tipoApoId = id; }
    public String  getNomeTipoApo()                     { return nomeTipoApo; }
    public void    setNomeTipoApo(String n)             { this.nomeTipoApo = n; }
    public String  getResponsavelAtual()                { return responsavelAtual; }
    public void    setResponsavelAtual(String r)        { this.responsavelAtual = r; }
    public String  getJustificativaAtual()              { return justificativaAtual; }
    public void    setJustificativaAtual(String j)      { this.justificativaAtual = j; }
    public String  getOrientadorId()                    { return orientadorId; }
    public void    setOrientadorId(String id)           { this.orientadorId = id; }
    public String  getNomeOrientador()                  { return nomeOrientador; }
    public void    setNomeOrientador(String n)          { this.nomeOrientador = n; }
    public int     getTotalAprovacoes()                 { return totalAprovacoes; }
    public void    setTotalAprovacoes(int n)            { this.totalAprovacoes = n; }
    public int     getAprovacoesRestantes()             { return aprovacoesRestantes; }
    public void    setAprovacoesRestantes(int n)        { this.aprovacoesRestantes = n; }
}
