package com.extensflow.dto;

import java.time.LocalDateTime;

public class NotificacaoDTO {
    private Long          id;
    private String        tipo;
    private String        mensagem;
    private LocalDateTime dataEnvio;
    private boolean       enviada;
    private Long          solicitacaoId;

    public Long          getId()                       { return id; }
    public void          setId(Long id)                { this.id = id; }
    public String        getTipo()                     { return tipo; }
    public void          setTipo(String t)             { this.tipo = t; }
    public String        getMensagem()                 { return mensagem; }
    public void          setMensagem(String m)         { this.mensagem = m; }
    public LocalDateTime getDataEnvio()                { return dataEnvio; }
    public void          setDataEnvio(LocalDateTime d) { this.dataEnvio = d; }
    public boolean       isEnviada()                   { return enviada; }
    public void          setEnviada(boolean e)         { this.enviada = e; }
    public Long          getSolicitacaoId()            { return solicitacaoId; }
    public void          setSolicitacaoId(Long s)      { this.solicitacaoId = s; }
}
