package com.extensflow.controller;

import com.extensflow.dto.EtapaRequest;
import com.extensflow.model.EtapaAvaliacao;
import com.extensflow.service.EtapaAvaliacaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/etapas")
public class EtapaController {

    @Autowired private EtapaAvaliacaoService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO')")
    public ResponseEntity<EtapaAvaliacao> criar(@Valid @RequestBody EtapaRequest req) {
        return ResponseEntity.status(201).body(service.criar(req));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO','ORIENTADOR')")
    public ResponseEntity<List<EtapaAvaliacao>> listar() {
        return ResponseEntity.ok(service.listarTodas());
    }

    @PostMapping("/{etapaId}/avaliadores/{avaliadorId}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<EtapaAvaliacao> adicionarAvaliador(
            @PathVariable Long etapaId,
            @PathVariable Long avaliadorId) {
        return ResponseEntity.ok(service.adicionarAvaliador(etapaId, avaliadorId));
    }

    @PutMapping("/{id}/encerrar")
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO')")
    public ResponseEntity<EtapaAvaliacao> encerrar(@PathVariable Long id) {
        return ResponseEntity.ok(service.encerrar(id));
    }
}
