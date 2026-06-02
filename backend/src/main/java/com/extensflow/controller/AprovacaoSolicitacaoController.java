package com.extensflow.controller;

import com.extensflow.dto.AprovacaoSolicitacaoResponse;
import com.extensflow.dto.VotoRequest;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.AprovacaoSolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints de votação dos coordenadores.
 *
 * POST  /api/solicitacoes/{id}/votar       → coordenador vota (APROVADO|RECUSADO)
 * GET   /api/solicitacoes/{id}/aprovacoes  → lista votos da solicitação
 * GET   /api/solicitacoes/{id}/aprovacoes/count → total de votos
 */
@RestController
@RequestMapping("/api/solicitacoes")
public class AprovacaoSolicitacaoController {

    @Autowired private AprovacaoSolicitacaoService service;

    /**
     * Coordenador registra seu voto (APROVADO ou RECUSADO).
     * Quando 2+ votos iguais são atingidos, o status é atualizado automaticamente.
     */
    @PostMapping("/{id}/votar")
    @PreAuthorize("hasAnyRole('COORDENADORIA', 'ADMIN')")
    public ResponseEntity<AprovacaoSolicitacaoResponse> votar(
            @PathVariable Long id,
            @Valid @RequestBody VotoRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.votar(id, req.getVoto(), principal));
    }

    /** Mantém compat retroativa — redireciona para votar(APROVADO). */
    @PostMapping("/{id}/aprovar")
    @PreAuthorize("hasAnyRole('COORDENADORIA', 'ADMIN')")
    public ResponseEntity<AprovacaoSolicitacaoResponse> aprovar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        VotoRequest req = new VotoRequest();
        req.setVoto("APROVADO");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.votar(id, "APROVADO", principal));
    }

    @GetMapping("/{id}/aprovacoes")
    @PreAuthorize("hasAnyRole('COORDENADORIA','SECRETARIA','COMISSAO','ORIENTADOR','ADMIN')")
    public ResponseEntity<List<AprovacaoSolicitacaoResponse>> listarVotos(
            @PathVariable Long id) {
        return ResponseEntity.ok(service.listarPorSolicitacao(id));
    }

    @GetMapping("/{id}/aprovacoes/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Long> contarVotos(@PathVariable Long id) {
        return ResponseEntity.ok(service.contarVotos(id));
    }
}
