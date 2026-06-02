package com.extensflow.model;

import com.extensflow.exception.BusinessException;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Máquina de estados da APO (Atividade Programada Obrigatória).
 *
 * Fluxo: Aluno/Orientador → Orientador → Comissão Julgadora → Coordenação → Secretaria → Arquivada → Lançada
 */
public enum StatusSolicitacao {

    // ── Fluxo APO ─────────────────────────────────────────────────────────────
    RASCUNHO,
    ENVIADA_ORIENTADOR,
    EM_AVALIACAO_ORIENTADOR,
    DEVOLVIDA_ALUNO,
    ABSTENCAO_ORIENTADOR,
    APROVADA_ORIENTADOR,
    ENVIADA_COMISSAO,
    EM_AVALIACAO_COMISSAO,
    DEVOLVIDA_ORIENTADOR,
    APROVADA_COMISSAO,
    ENVIADA_COORDENACAO,
    EM_AVALIACAO_COORDENACAO,
    APROVADA_COORDENACAO,
    ENVIADA_SECRETARIA,
    AGUARDANDO_ASSINATURA,
    ASSINADA,
    ARQUIVADA,
    LANCADA_SISTEMA,
    FINALIZADA,
    REPROVADA_CANCELADA,

    // ── Legados (mantidos para dados existentes) ──────────────────────────────
    EM_PREENCHIMENTO,
    ENVIADA_PARA_ANALISE,
    APROVADA_COORDENADORES,
    RECUSADA_COORDENADORES,
    APROVADA_FINAL,
    RECUSADA_FINAL,
    EM_AVALIACAO,
    APROVADA,
    REPROVADA,
    CONCLUIDA,
    CANCELADA;

    private static final Map<StatusSolicitacao, Set<StatusSolicitacao>> TRANSICOES;

    static {
        TRANSICOES = new EnumMap<>(StatusSolicitacao.class);

        // ── Fluxo APO ─────────────────────────────────────────────────────────
        TRANSICOES.put(RASCUNHO,                 EnumSet.of(ENVIADA_ORIENTADOR, REPROVADA_CANCELADA));
        TRANSICOES.put(ENVIADA_ORIENTADOR,       EnumSet.of(EM_AVALIACAO_ORIENTADOR, REPROVADA_CANCELADA));
        TRANSICOES.put(EM_AVALIACAO_ORIENTADOR,  EnumSet.of(DEVOLVIDA_ALUNO, ABSTENCAO_ORIENTADOR,
                                                             APROVADA_ORIENTADOR, REPROVADA_CANCELADA));
        TRANSICOES.put(DEVOLVIDA_ALUNO,          EnumSet.of(ENVIADA_ORIENTADOR, REPROVADA_CANCELADA));
        TRANSICOES.put(ABSTENCAO_ORIENTADOR,     EnumSet.of(ENVIADA_COORDENACAO));
        TRANSICOES.put(APROVADA_ORIENTADOR,      EnumSet.of(ENVIADA_COMISSAO));
        TRANSICOES.put(ENVIADA_COMISSAO,         EnumSet.of(EM_AVALIACAO_COMISSAO));
        TRANSICOES.put(EM_AVALIACAO_COMISSAO,    EnumSet.of(DEVOLVIDA_ORIENTADOR, APROVADA_COMISSAO,
                                                             REPROVADA_CANCELADA));
        TRANSICOES.put(DEVOLVIDA_ORIENTADOR,     EnumSet.of(EM_AVALIACAO_ORIENTADOR, ENVIADA_COMISSAO,
                                                             ENVIADA_COORDENACAO, REPROVADA_CANCELADA));
        TRANSICOES.put(APROVADA_COMISSAO,        EnumSet.of(ENVIADA_COORDENACAO));
        TRANSICOES.put(ENVIADA_COORDENACAO,      EnumSet.of(EM_AVALIACAO_COORDENACAO));
        TRANSICOES.put(EM_AVALIACAO_COORDENACAO, EnumSet.of(DEVOLVIDA_ORIENTADOR, APROVADA_COORDENACAO,
                                                             REPROVADA_CANCELADA));
        TRANSICOES.put(APROVADA_COORDENACAO,     EnumSet.of(ENVIADA_SECRETARIA));
        TRANSICOES.put(ENVIADA_SECRETARIA,       EnumSet.of(AGUARDANDO_ASSINATURA));
        TRANSICOES.put(AGUARDANDO_ASSINATURA,    EnumSet.of(ASSINADA, REPROVADA_CANCELADA));
        TRANSICOES.put(ASSINADA,                 EnumSet.of(ARQUIVADA));
        TRANSICOES.put(ARQUIVADA,                EnumSet.of(LANCADA_SISTEMA));
        TRANSICOES.put(LANCADA_SISTEMA,          EnumSet.of(FINALIZADA));

        // ── Legados ───────────────────────────────────────────────────────────
        TRANSICOES.put(EM_PREENCHIMENTO,       EnumSet.of(ENVIADA_PARA_ANALISE, CANCELADA));
        TRANSICOES.put(ENVIADA_PARA_ANALISE,   EnumSet.of(APROVADA_COORDENADORES, RECUSADA_COORDENADORES, CANCELADA));
        TRANSICOES.put(APROVADA_COORDENADORES, EnumSet.of(APROVADA_FINAL, RECUSADA_FINAL));
        TRANSICOES.put(EM_AVALIACAO,           EnumSet.of(APROVADA_FINAL, RECUSADA_FINAL, APROVADA, REPROVADA));
        TRANSICOES.put(APROVADA,               EnumSet.of(CONCLUIDA, APROVADA_FINAL));
    }

    public void validarTransicao(StatusSolicitacao destino) {
        Set<StatusSolicitacao> permitidos = TRANSICOES.getOrDefault(this, EnumSet.noneOf(StatusSolicitacao.class));
        if (!permitidos.contains(destino)) {
            throw new BusinessException(String.format(
                    "Transição inválida: %s → %s. Permitidas: %s",
                    this.name(), destino.name(),
                    permitidos.isEmpty() ? "nenhuma (estado terminal)" : permitidos.toString()
            ));
        }
    }

    public boolean isTerminal() {
        return !TRANSICOES.containsKey(this);
    }

    public boolean aguardandoCoordenadores() {
        return this == ENVIADA_PARA_ANALISE;
    }

    public boolean aguardandoOrientador() {
        return this == ENVIADA_ORIENTADOR || this == EM_AVALIACAO_ORIENTADOR;
    }

    public boolean aguardandoComissao() {
        return this == APROVADA_COORDENADORES || this == EM_AVALIACAO
                || this == ENVIADA_COMISSAO || this == EM_AVALIACAO_COMISSAO;
    }

    public boolean aguardandoCoordenacao() {
        return this == ENVIADA_COORDENACAO || this == EM_AVALIACAO_COORDENACAO
                || this == ABSTENCAO_ORIENTADOR;
    }

    public boolean aguardandoSecretaria() {
        return this == ENVIADA_SECRETARIA || this == AGUARDANDO_ASSINATURA;
    }
}
