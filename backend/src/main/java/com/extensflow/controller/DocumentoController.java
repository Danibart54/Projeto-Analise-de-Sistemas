package com.extensflow.controller;

import com.extensflow.model.Documento;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.DocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    @Autowired private DocumentoService service;

    @PostMapping("/solicitacao/{solicitacaoId}")
    public ResponseEntity<Documento> gerar(
            @PathVariable Long solicitacaoId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(
                service.gerar(solicitacaoId, body.get("tipo"), principal.email()));
    }

    @PutMapping("/{id}/assinar")
    public ResponseEntity<Documento> assinar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        // V-05 + V-10: quem assina é sempre o usuário autenticado
        return ResponseEntity.ok(service.assinar(id, principal.email()));
    }

    @GetMapping("/solicitacao/{solicitacaoId}")
    public ResponseEntity<List<Documento>> listar(@PathVariable Long solicitacaoId) {
        return ResponseEntity.ok(service.listarPorSolicitacao(solicitacaoId));
    }
}
