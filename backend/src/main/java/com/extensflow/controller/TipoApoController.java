package com.extensflow.controller;

import com.extensflow.model.TipoApo;
import com.extensflow.repository.TipoApoRepository;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.exception.BusinessException;
import com.extensflow.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tipos-apo")
public class TipoApoController {

    @Autowired private TipoApoRepository repo;

    @GetMapping
    public ResponseEntity<List<TipoApo>> listar() {
        return ResponseEntity.ok(repo.findByAtivoTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TipoApo> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de APO não encontrado")));
    }

    @PostMapping
    public ResponseEntity<TipoApo> criar(
            @RequestBody TipoApo tipo,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Apenas o Admin pode gerenciar tipos de APO");
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(tipo));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TipoApo> atualizar(
            @PathVariable Long id,
            @RequestBody TipoApo tipo,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Apenas o Admin pode gerenciar tipos de APO");
        TipoApo existente = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de APO não encontrado"));
        existente.setNome(tipo.getNome());
        existente.setDescricao(tipo.getDescricao());
        existente.setCreditos(tipo.getCreditos());
        existente.setLimiteCreditos(tipo.getLimiteCreditos());
        existente.setObrigatoria(tipo.isObrigatoria());
        existente.setAnoRegra(tipo.getAnoRegra());
        existente.setAplicavelPara(tipo.getAplicavelPara());
        existente.setAtivo(tipo.isAtivo());
        return ResponseEntity.ok(repo.save(existente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Apenas o Admin pode gerenciar tipos de APO");
        TipoApo tipo = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de APO não encontrado"));
        tipo.setAtivo(false);
        repo.save(tipo);
        return ResponseEntity.noContent().build();
    }
}
