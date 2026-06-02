package com.extensflow.controller;

import com.extensflow.model.Curso;
import com.extensflow.repository.CursoRepository;
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
@RequestMapping("/api/cursos")
public class CursoController {

    @Autowired private CursoRepository repo;

    @GetMapping
    public ResponseEntity<List<Curso>> listar() {
        return ResponseEntity.ok(repo.findByAtivoTrue());
    }

    @PostMapping
    public ResponseEntity<Curso> criar(
            @RequestBody Curso curso,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Apenas o Admin pode gerenciar cursos");
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(curso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Curso> atualizar(
            @PathVariable Long id,
            @RequestBody Curso curso,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Apenas o Admin pode gerenciar cursos");
        Curso existente = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Curso não encontrado"));
        existente.setNome(curso.getNome());
        existente.setNivel(curso.getNivel());
        existente.setCreditosNecessarios(curso.getCreditosNecessarios());
        existente.setAtivo(curso.isAtivo());
        return ResponseEntity.ok(repo.save(existente));
    }
}
