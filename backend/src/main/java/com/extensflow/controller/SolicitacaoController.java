package com.extensflow.controller;

import com.extensflow.dto.FormularioRequest;
import com.extensflow.dto.ResultadoFinalRequest;
import com.extensflow.dto.SolicitacaoRequest;
import com.extensflow.dto.SolicitacaoResponse;
import com.extensflow.dto.StatusRequest;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.SolicitacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes")
public class SolicitacaoController {

    @Autowired private SolicitacaoService service;

    @PostMapping
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<SolicitacaoResponse> criar(
            @Valid @RequestBody SolicitacaoRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(req, principal));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ORIENTADOR','COMISSAO','SECRETARIA','COORDENADORIA')")
    public ResponseEntity<List<SolicitacaoResponse>> listar(
            @RequestParam(required = false) String status) {
        if (status != null) return ResponseEntity.ok(service.listarPorStatus(status));
        return ResponseEntity.ok(service.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitacaoResponse> buscar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.buscarPorId(id, principal));
    }

    @GetMapping("/aluno/{alunoId}")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<List<SolicitacaoResponse>> listarPorAluno(
            @PathVariable Long alunoId,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.listarPorAluno(alunoId, principal));
    }

    @PutMapping("/{id}/formulario")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<SolicitacaoResponse> atualizarFormulario(
            @PathVariable Long id,
            @Valid @RequestBody FormularioRequest req,         // @Valid added
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.atualizarFormulario(id, req, principal));
    }

    @PutMapping("/{id}/enviar")
    @PreAuthorize("hasRole('ALUNO')")
    public ResponseEntity<SolicitacaoResponse> enviar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.enviarParaAnalise(id, principal));
    }

    // Replaced raw Map<String,String> with typed @Valid DTO
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ORIENTADOR','COMISSAO','SECRETARIA')")
    public ResponseEntity<SolicitacaoResponse> atualizarStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.atualizarStatus(id, req.getStatus(), principal));
    }

    // Replaced raw Map<String,Object> with typed @Valid DTO
    @PutMapping("/{id}/resultado-final")
    @PreAuthorize("hasAnyRole('COMISSAO','COORDENADORIA')")
    public ResponseEntity<SolicitacaoResponse> resultadoFinal(
            @PathVariable Long id,
            @Valid @RequestBody ResultadoFinalRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(
                service.definirResultadoFinal(id, req.getStatus(), req.getPontuacao(), principal));
    }
}
