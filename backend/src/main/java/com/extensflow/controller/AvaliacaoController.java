package com.extensflow.controller;

import com.extensflow.dto.AvaliacaoRequest;
import com.extensflow.dto.AvaliacaoResponse;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.AvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/avaliacoes")
public class AvaliacaoController {

    @Autowired private AvaliacaoService service;

    @PostMapping("/solicitacao/{solicitacaoId}")
    @PreAuthorize("hasAnyRole('ORIENTADOR','COMISSAO')")
    public ResponseEntity<AvaliacaoResponse> registrar(
            @PathVariable Long solicitacaoId,
            @Valid @RequestBody AvaliacaoRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        // V-05: avaliador registra como ele mesmo — ignora avaliadorId do body
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.registrar(solicitacaoId, req, principal));
    }

    @GetMapping("/avaliador/minhas")
    @PreAuthorize("hasAnyRole('ORIENTADOR','COMISSAO')")
    public ResponseEntity<List<AvaliacaoResponse>> minhasAvaliacoes(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        // V-05: usa ID do JWT, não parâmetro de URL
        return ResponseEntity.ok(service.listarPorAvaliador(principal.id()));
    }
}
