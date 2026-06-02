package com.extensflow.service;

import com.extensflow.dto.AvaliacaoRequest;
import com.extensflow.dto.AvaliacaoResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.*;
import com.extensflow.repository.*;
import com.extensflow.security.UsuarioPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AvaliacaoService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private AvaliacaoRepository avaliacaoRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private EtapaAvaliacaoRepository etapaRepo;
    @Autowired private SolicitacaoRepository solicitacaoRepo;

    @Transactional
    public AvaliacaoResponse registrar(Long solicitacaoId, AvaliacaoRequest req,
                                       UsuarioPrincipal principal) {

        Solicitacao sol = solicitacaoRepo.findById(solicitacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada"));

        // V-09: Rejeitar solicitações em estados terminais ou ainda não enviadas
        if (sol.getStatus() == StatusSolicitacao.EM_PREENCHIMENTO)
            throw new BusinessException(
                    "Solicitação ainda em preenchimento — não pode ser avaliada");

        // V-05: avaliador é sempre o usuário autenticado, nunca avaliadorId do body
        Usuario avaliador = usuarioRepo.findById(principal.id())
                .orElseThrow(() -> new ResourceNotFoundException("Avaliador não encontrado"));

        Avaliacao av = new Avaliacao();
        av.setNota(req.getNota());
        av.setDecisao(req.getDecisao());
        av.setAvaliador(avaliador);

        if (req.getJustificativa() != null && !req.getJustificativa().isBlank()) {
            av.setJustificativa(new Justificativa(req.getJustificativa()));
        }

        if (req.getEtapaId() != null) {
            EtapaAvaliacao etapa = etapaRepo.findById(req.getEtapaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Etapa não encontrada"));
            av.setEtapa(etapa);
        }

        // V-09: Determinar próximo status e validar pela máquina de estados
        StatusSolicitacao novoStatus = resolverNovoStatus(req.getDecisao());
        sol.getStatus().validarTransicao(novoStatus); // lança BusinessException se inválido
        StatusSolicitacao anterior = sol.getStatus();
        sol.setStatus(novoStatus);
        solicitacaoRepo.save(sol);

        Avaliacao salva = avaliacaoRepo.save(av);

        // V-10: log de auditoria com contexto completo
        audit.info("AVALIACAO_REGISTRADA solicitacao={} statusAnterior={} novoStatus={} decisao={} nota={} avaliador={}",
                solicitacaoId, anterior, novoStatus, req.getDecisao(), req.getNota(), principal.email());

        return AvaliacaoResponse.de(salva, solicitacaoId);
    }

    public List<AvaliacaoResponse> listarPorAvaliador(Long avaliadorId) {
        return avaliacaoRepo.findByAvaliadorId(avaliadorId).stream()
                .map(a -> {
                    Long solId = a.getEtapa() != null
                            && a.getEtapa().getProcesso() != null
                            && a.getEtapa().getProcesso().getSolicitacao() != null
                            ? a.getEtapa().getProcesso().getSolicitacao().getId() : null;
                    return AvaliacaoResponse.de(a, solId);
                })
                .toList();
    }

    // ── Helper: mapeia decisão textual para StatusSolicitacao ────────────────
    private StatusSolicitacao resolverNovoStatus(String decisao) {
        return switch (decisao.toUpperCase()) {
            case "APROVADA"  -> StatusSolicitacao.APROVADA;
            case "REPROVADA" -> StatusSolicitacao.REPROVADA;
            // "EM_AVALIACAO", "PENDENTE" etc. → avança para avaliação
            default          -> StatusSolicitacao.EM_AVALIACAO;
        };
    }
}
