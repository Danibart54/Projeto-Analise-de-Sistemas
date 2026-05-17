package com.extensflow.model;

import com.extensflow.exception.BusinessException;

import java.util.EnumMap;
import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * V-09 — Máquina de estados explícita.
 *
 * Diagrama de transições:
 *
 *   EM_PREENCHIMENTO ──► ENVIADA_PARA_ANALISE ──► EM_AVALIACAO ──► APROVADA ──► CONCLUIDA
 *          │                     │                     │
 *          └──► CANCELADA        └──► CANCELADA         └──► REPROVADA
 *
 * Regras:
 *  - Qualquer tentativa de transição fora do mapa lança BusinessException.
 *  - CONCLUIDA, REPROVADA e CANCELADA são estados terminais (sem saída).
 *  - A validação ocorre ANTES de qualquer save(), garantindo consistência.
 */
public enum StatusSolicitacao {

    EM_PREENCHIMENTO,
    ENVIADA_PARA_ANALISE,
    EM_AVALIACAO,
    APROVADA,
    REPROVADA,   // terminal
    CONCLUIDA,   // terminal
    CANCELADA;   // terminal

    // EnumMap é mais eficiente que HashMap para chaves enum
    private static final Map<StatusSolicitacao, Set<StatusSolicitacao>> TRANSICOES;

    static {
        TRANSICOES = new EnumMap<>(StatusSolicitacao.class);
        TRANSICOES.put(EM_PREENCHIMENTO,     EnumSet.of(ENVIADA_PARA_ANALISE, CANCELADA));
        TRANSICOES.put(ENVIADA_PARA_ANALISE, EnumSet.of(EM_AVALIACAO, CANCELADA));
        TRANSICOES.put(EM_AVALIACAO,         EnumSet.of(APROVADA, REPROVADA));
        TRANSICOES.put(APROVADA,             EnumSet.of(CONCLUIDA));
        // REPROVADA, CONCLUIDA, CANCELADA → sem entradas = estados terminais
    }

    /**
     * Valida se a transição para {@code destino} é permitida a partir do estado atual.
     *
     * @param destino Estado de destino desejado.
     * @throws BusinessException com mensagem clara se a transição for inválida.
     */
    public void validarTransicao(StatusSolicitacao destino) {
        Set<StatusSolicitacao> permitidos = TRANSICOES.getOrDefault(this, EnumSet.noneOf(StatusSolicitacao.class));
        if (!permitidos.contains(destino)) {
            throw new BusinessException(String.format(
                    "Transição de status inválida: %s → %s. Transições permitidas a partir de %s: %s",
                    this.name(), destino.name(), this.name(),
                    permitidos.isEmpty() ? "nenhuma (estado terminal)" : permitidos.toString()
            ));
        }
    }

    /** Retorna true se este estado não tem saídas (não pode mais ser alterado). */
    public boolean isTerminal() {
        return !TRANSICOES.containsKey(this);
    }
}
