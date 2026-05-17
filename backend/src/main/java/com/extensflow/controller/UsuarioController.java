package com.extensflow.controller;

import com.extensflow.dto.UsuarioRequest;
import com.extensflow.dto.UsuarioResponse;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired private UsuarioService service;

    // V-06: Auto-cadastro público — APENAS cria Aluno, nunca perfis elevados
    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody UsuarioRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.cadastrarAluno(req));
    }

    // V-06: Cadastro de orientador/comissão restrito à Secretaria
    @PostMapping("/admin")
    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<UsuarioResponse> cadastrarPorAdmin(
            @Valid @RequestBody UsuarioRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.cadastrar(req, principal.email()));
    }

    // V-03: Retorna DTO (sem senha) e requer autenticação
    @GetMapping("/alunos")
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO')")
    public ResponseEntity<List<UsuarioResponse>> listarAlunos() {
        return ResponseEntity.ok(service.listarAlunos());
    }

    @GetMapping("/orientadores")
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO')")
    public ResponseEntity<List<UsuarioResponse>> listarOrientadores() {
        return ResponseEntity.ok(service.listarOrientadores());
    }

    @GetMapping("/membros-comissao")
    @PreAuthorize("hasAnyRole('SECRETARIA','COMISSAO')")
    public ResponseEntity<List<UsuarioResponse>> listarMembros() {
        return ResponseEntity.ok(service.listarMembros());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<Void> desativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        service.desativar(id, principal.email());
        return ResponseEntity.noContent().build();
    }
}
