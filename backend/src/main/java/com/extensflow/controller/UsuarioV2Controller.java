package com.extensflow.controller;

import com.extensflow.dto.UsuarioV2Request;
import com.extensflow.dto.UsuarioV2Response;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.UsuarioV2Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints para gerenciamento de usuários com múltiplas funções.
 *
 * GET    /api/v2/usuarios              → Lista todos os usuários (Secretaria/Admin)
 * GET    /api/v2/usuarios/{id}         → Busca por ID
 * GET    /api/v2/usuarios/funcao/{nome}→ Filtra por função
 * POST   /api/v2/usuarios              → Cadastra com múltiplas funções (Secretaria)
 * PUT    /api/v2/usuarios/{id}         → Atualiza dados e funções (Secretaria)
 * DELETE /api/v2/usuarios/{id}         → Desativa (Secretaria)
 */
@RestController
@RequestMapping("/api/v2/usuarios")
public class UsuarioV2Controller {

    @Autowired private UsuarioV2Service service;

    @GetMapping
    @PreAuthorize("hasAnyRole('SECRETARIA','COORDENADORIA')")
    public ResponseEntity<List<UsuarioV2Response>> listar(
            @RequestParam(defaultValue = "true") boolean apenasAtivos) {
        List<UsuarioV2Response> lista = apenasAtivos
                ? service.listarAtivos()
                : service.listarTodos();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SECRETARIA','COORDENADORIA','COMISSAO')")
    public ResponseEntity<UsuarioV2Response> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    /**
     * Filtra usuários por função.
     * Útil para listar todos os coordenadores, orientadores, etc.
     * Exemplo: GET /api/v2/usuarios/funcao/COORDENADOR
     */
    @GetMapping("/funcao/{nomeFuncao}")
    @PreAuthorize("hasAnyRole('SECRETARIA','COORDENADORIA','COMISSAO')")
    public ResponseEntity<List<UsuarioV2Response>> listarPorFuncao(
            @PathVariable String nomeFuncao) {
        return ResponseEntity.ok(service.listarPorFuncao(nomeFuncao));
    }

    @PostMapping
    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<UsuarioV2Response> cadastrar(
            @Valid @RequestBody UsuarioV2Request req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        if (req.getSenha() == null || req.getSenha().isBlank())
            throw new com.extensflow.exception.BusinessException("Senha é obrigatória para novos usuários");
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(service.cadastrar(req, principal.email()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SECRETARIA')")
    public ResponseEntity<UsuarioV2Response> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioV2Request req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.atualizar(id, req, principal.email()));
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
