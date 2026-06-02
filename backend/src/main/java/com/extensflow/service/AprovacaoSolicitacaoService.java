package com.extensflow.service;

import com.extensflow.dto.AprovacaoSolicitacaoResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.*;
import com.extensflow.model.AprovacaoSolicitacao.Voto;
import com.extensflow.repository.*;
import com.extensflow.security.UsuarioPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Gerencia o fluxo de votação dos coordenadores.
 *
 * Regras de negócio:
 * 1. Apenas COORDENADORIA pode votar.
 * 2. Cada coordenador vota uma única vez por solicitação (APROVADO ou RECUSADO).
 * 3. Resultado por saldo de votos:
 *    - 2+ APROVADOS  → APROVADA_COORDENADORES (segue para comissão julgadora)
 *    - 2+ RECUSADOS  → RECUSADA_COORDENADORES (encerrada)
 *    - O terceiro voto é registrado mas não muda mais o status se já definido.
 * 4. Solicitação precisa estar em ENVIADA_PARA_ANALISE para receber votos.
 */
@Service
public class AprovacaoSolicitacaoService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");
    private static final int TOTAL_COORDENADORES = 3;

    @Autowired private AprovacaoSolicitacaoRepository aprovacaoRepo;
    @Autowired private SolicitacaoRepository          solicitacaoRepo;
    @Autowired private UsuarioRepository              usuarioRepo;
    @Autowired private UsuarioV2Repository            usuarioV2Repo;

    /**
     * Registra o voto de um coordenador.
     * Atualiza o status da solicitação quando o resultado ficar matematicamente definido.
     */
    @Transactional
    public AprovacaoSolicitacaoResponse votar(Long solicitacaoId, String votoStr,
                                               UsuarioPrincipal principal) {

        // 1. Verificar permissão — apenas COORDENADORIA
        String role = principal.role() != null ? principal.role().toUpperCase() : "";
        boolean temFuncaoCoord = principal.funcoes() != null &&
                principal.funcoes().stream().anyMatch(f -> f.equalsIgnoreCase("COORDENADOR"));

        if (!role.equals("COORDENADORIA") && !role.equals("ADMIN") && !temFuncaoCoord) {
            throw new BusinessException("Apenas coordenadores podem votar na aprovação");
        }

        Voto voto = Voto.valueOf(votoStr.toUpperCase());

        // 2. Buscar solicitação
        Solicitacao sol = solicitacaoRepo.findById(solicitacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação #" + solicitacaoId + " não encontrada"));

        // 3. Verificar estado válido para votação
        if (!sol.getStatus().aguardandoCoordenadores()) {
            throw new BusinessException(
                "Esta solicitação não está aguardando votação dos coordenadores. Status atual: " + sol.getStatus().name());
        }

        // 4. Verificar voto duplicado
        if (aprovacaoRepo.existsBySolicitacaoIdAndCoordenadorId(solicitacaoId, principal.id())) {
            throw new BusinessException("Você já votou nesta solicitação");
        }

        // 5. Buscar entidade do coordenador (legado ou V2)
        Usuario coordenador = resolverUsuario(principal.id(), principal.email());

        // 6. Registrar voto
        AprovacaoSolicitacao aprovacao;
        try {
            aprovacao = new AprovacaoSolicitacao(sol, coordenador, voto);
            aprovacao = aprovacaoRepo.save(aprovacao);
        } catch (DataIntegrityViolationException e) {
            throw new BusinessException("Você já votou nesta solicitação (conflito de concorrência)");
        }

        audit.info("VOTO_REGISTRADO solicitacaoId={} coordenadorId={} voto={} email={}",
                solicitacaoId, principal.id(), voto, principal.email());

        // 7. Contagens pós-voto
        long totalVotos     = aprovacaoRepo.countBySolicitacaoId(solicitacaoId);
        long totalAprovados = aprovacaoRepo.countBySolicitacaoIdAndVoto(solicitacaoId, Voto.APROVADO);
        long totalRecusados = aprovacaoRepo.countBySolicitacaoIdAndVoto(solicitacaoId, Voto.RECUSADO);

        // 8. Só decide após os 3 votos obrigatórios; saldo positivo = aprovado
        if (totalVotos >= TOTAL_COORDENADORES) {
            if (totalAprovados > totalRecusados) {
                sol.setStatus(StatusSolicitacao.APROVADA_COORDENADORES);
                audit.info("COORDENADORES_APROVARAM solicitacaoId={} aprovados={} recusados={}",
                        solicitacaoId, totalAprovados, totalRecusados);
            } else {
                sol.setStatus(StatusSolicitacao.RECUSADA_COORDENADORES);
                audit.info("COORDENADORES_RECUSARAM solicitacaoId={} aprovados={} recusados={}",
                        solicitacaoId, totalAprovados, totalRecusados);
            }
            solicitacaoRepo.save(sol);
        }

        return AprovacaoSolicitacaoResponse.de(aprovacao,
                (int) totalVotos, (int) totalAprovados, (int) totalRecusados);
    }

    public List<AprovacaoSolicitacaoResponse> listarPorSolicitacao(Long solicitacaoId) {
        if (!solicitacaoRepo.existsById(solicitacaoId))
            throw new ResourceNotFoundException("Solicitação #" + solicitacaoId + " não encontrada");

        List<AprovacaoSolicitacao> votos = aprovacaoRepo.findBySolicitacaoId(solicitacaoId);
        int total     = votos.size();
        int aprovados = (int) votos.stream().filter(v -> v.getVoto() == Voto.APROVADO).count();
        int recusados = (int) votos.stream().filter(v -> v.getVoto() == Voto.RECUSADO).count();

        return votos.stream()
                .map(v -> AprovacaoSolicitacaoResponse.de(v, total, aprovados, recusados))
                .collect(Collectors.toList());
    }

    public long contarVotos(Long solicitacaoId) {
        return aprovacaoRepo.countBySolicitacaoId(solicitacaoId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Resolve o usuário pelo ID.
     * Tenta primeiro a tabela legada (Usuario), depois V2.
     * Cria uma proxy legada se o coordenador só existir na tabela V2.
     */
    private Usuario resolverUsuario(Long id, String email) {
        return usuarioRepo.findById(id).orElseGet(() -> {
            // Coordenador é V2 — não existe na tabela legada.
            // Cria uma entidade proxy apenas para o FK na tabela de aprovacoes.
            UsuarioV2 v2 = usuarioV2Repo.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new ResourceNotFoundException(
                        "Coordenador não encontrado: " + email));

            // Verifica se já existe um registro legado com esse email
            return usuarioRepo.findByEmail(email).orElseGet(() -> {
                // Cria registro mínimo na tabela legada para satisfazer o FK
                com.extensflow.model.MembroComissao proxy = new com.extensflow.model.MembroComissao();
                proxy.setNome(v2.getNome());
                proxy.setEmail(v2.getEmail());
                proxy.setSenha(v2.getSenha());
                proxy.setTipoUsuario(TipoUsuario.MEMBRO_COMISSAO);
                proxy.setAtivo(true);
                return usuarioRepo.save(proxy);
            });
        });
    }
}
