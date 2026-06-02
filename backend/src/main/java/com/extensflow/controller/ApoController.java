package com.extensflow.controller;

import com.extensflow.dto.SolicitacaoRequest;
import com.extensflow.dto.SolicitacaoResponse;
import com.extensflow.model.HistoricoApo;
import com.extensflow.model.StatusSolicitacao;
import com.extensflow.repository.HistoricoApoRepository;
import com.extensflow.exception.BusinessException;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.SolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Endpoints do fluxo APO: /api/apos
 * Cobre criação, envio ao orientador, e ações de cada etapa do fluxo.
 */
@RestController
@RequestMapping("/api/apos")
public class ApoController {

    @Autowired private SolicitacaoService     service;
    @Autowired private HistoricoApoRepository historicoRepo;

    // ── Listagem ──────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<Page<SolicitacaoResponse>> listar(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long orientadorId,
            @PageableDefault(size = 20, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        if (status != null) return ResponseEntity.ok(service.listarPorStatusPaginado(status, pageable));
        if (orientadorId != null) return ResponseEntity.ok(service.listarPorOrientador(orientadorId, pageable));
        return ResponseEntity.ok(service.listarTodasPaginado(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoResponse> buscar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.buscarPorId(id, principal));
    }

    @GetMapping("/aluno/{alunoId}")
    public ResponseEntity<List<SolicitacaoResponse>> listarPorAluno(
            @PathVariable Long alunoId,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.listarPorAlunoV2(alunoId, principal));
    }

    @GetMapping("/{id}/historico")
    public ResponseEntity<List<HistoricoApo>> historico(@PathVariable Long id) {
        return ResponseEntity.ok(historicoRepo.findBySolicitacaoIdOrderByDataAsc(id));
    }

    // ── Criação ───────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<SolicitacaoResponse> criar(
            @Valid @RequestBody SolicitacaoRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.status(201).body(service.criarApo(req, principal));
    }

    // ── Enviar ao Orientador ──────────────────────────────────────────────────

    @PutMapping("/{id}/enviar-orientador")
    public ResponseEntity<SolicitacaoResponse> enviarOrientador(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.ENVIADA_ORIENTADOR, principal, "ENVIADA_ORIENTADOR", null));
    }

    // ── Ações do Orientador ───────────────────────────────────────────────────

    @PutMapping("/{id}/orientador/iniciar-avaliacao")
    public ResponseEntity<SolicitacaoResponse> orientadorIniciar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.EM_AVALIACAO_ORIENTADOR, principal, "EM_AVALIACAO_ORIENTADOR", null));
    }

    @PutMapping("/{id}/orientador/aprovar")
    public ResponseEntity<SolicitacaoResponse> orientadorAprovar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body != null ? body.get("justificativa") : null;
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.APROVADA_ORIENTADOR, principal, "APROVADA_ORIENTADOR", justificativa));
    }

    @PutMapping("/{id}/orientador/devolver")
    public ResponseEntity<SolicitacaoResponse> orientadorDevolver(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para devolução");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.DEVOLVIDA_ALUNO, principal, "DEVOLVIDA_ALUNO", justificativa));
    }

    @PutMapping("/{id}/orientador/abster")
    public ResponseEntity<SolicitacaoResponse> orientadorAbster(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para abstenção");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.ABSTENCAO_ORIENTADOR, principal, "ABSTENCAO_ORIENTADOR", justificativa));
    }

    // ── Ações da Comissão Julgadora ───────────────────────────────────────────

    @PutMapping("/{id}/comissao/iniciar-avaliacao")
    public ResponseEntity<SolicitacaoResponse> comissaoIniciar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.EM_AVALIACAO_COMISSAO, principal, "EM_AVALIACAO_COMISSAO", null));
    }

    @PutMapping("/{id}/comissao/aprovar")
    public ResponseEntity<SolicitacaoResponse> comissaoAprovar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body != null ? (String) body.get("justificativa") : null;
        Long novoTipoApoId = body != null && body.get("tipoApoId") != null
                ? Long.valueOf(body.get("tipoApoId").toString()) : null;
        return ResponseEntity.ok(service.comissaoAprovar(id, novoTipoApoId, justificativa, principal));
    }

    @PutMapping("/{id}/comissao/devolver")
    public ResponseEntity<SolicitacaoResponse> comissaoDevolver(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para devolução");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.DEVOLVIDA_ORIENTADOR, principal, "DEVOLVIDA_ORIENTADOR", justificativa));
    }

    @PutMapping("/{id}/comissao/reprovar")
    public ResponseEntity<SolicitacaoResponse> comissaoReprovar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para reprovação");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.REPROVADA_CANCELADA, principal, "REPROVADA_CANCELADA", justificativa));
    }

    // ── Ações da Coordenação ─────────────────────────────────────────────────

    @PutMapping("/{id}/coordenacao/iniciar-avaliacao")
    public ResponseEntity<SolicitacaoResponse> coordenacaoIniciar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.EM_AVALIACAO_COORDENACAO, principal, "EM_AVALIACAO_COORDENACAO", null));
    }

    @PutMapping("/{id}/coordenacao/aprovar")
    public ResponseEntity<SolicitacaoResponse> coordenacaoAprovar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body != null ? (String) body.get("justificativa") : null;
        Long novoTipoApoId = body != null && body.get("tipoApoId") != null
                ? Long.valueOf(body.get("tipoApoId").toString()) : null;
        return ResponseEntity.ok(service.coordenacaoAprovar(id, novoTipoApoId, justificativa, principal));
    }

    @PutMapping("/{id}/coordenacao/devolver")
    public ResponseEntity<SolicitacaoResponse> coordenacaoDevolver(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para devolução");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.DEVOLVIDA_ORIENTADOR, principal, "DEVOLVIDA_ORIENTADOR", justificativa));
    }

    @PutMapping("/{id}/coordenacao/reprovar")
    public ResponseEntity<SolicitacaoResponse> coordenacaoReprovar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        String justificativa = body.get("justificativa");
        if (justificativa == null || justificativa.isBlank())
            throw new BusinessException("Justificativa é obrigatória para reprovação");
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.REPROVADA_CANCELADA, principal, "REPROVADA_CANCELADA", justificativa));
    }

    // ── Ações da Secretaria ──────────────────────────────────────────────────

    @PutMapping("/{id}/secretaria/aguardar-assinatura")
    public ResponseEntity<SolicitacaoResponse> secretariaAguardarAssinatura(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.AGUARDANDO_ASSINATURA, principal, "AGUARDANDO_ASSINATURA", null));
    }

    @PutMapping("/{id}/secretaria/assinar")
    public ResponseEntity<SolicitacaoResponse> secretariaAssinar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.ASSINADA, principal, "ASSINADA", null));
    }

    @PutMapping("/{id}/secretaria/arquivar")
    public ResponseEntity<SolicitacaoResponse> secretariaArquivar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.transicionarStatus(id,
                StatusSolicitacao.ARQUIVADA, principal, "ARQUIVADA", null));
    }

    @PutMapping("/{id}/secretaria/lancar-sistema")
    public ResponseEntity<SolicitacaoResponse> secretariaLancar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.lancarNoSistema(id, principal));
    }

    // ── Créditos ─────────────────────────────────────────────────────────────

    @GetMapping("/creditos/alunos")
    public ResponseEntity<List<Map<String, Object>>> creditosAlunos(
            @RequestParam(required = false) String tipoAluno,
            @RequestParam(required = false) Long orientadorId,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.resumoCreditosAlunos(tipoAluno, orientadorId));
    }
}
