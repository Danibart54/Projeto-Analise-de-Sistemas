package com.extensflow.controller;

import com.extensflow.dto.AtribuirFuncoesRequest;
import com.extensflow.dto.UsuarioV2Request;
import com.extensflow.dto.UsuarioV2Response;
import com.extensflow.exception.BusinessException;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.UsuarioV2Service;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Endpoints exclusivos do administrador.
 * A flag admin é verificada diretamente no UsuarioPrincipal (extraído do JWT),
 * sem necessidade de query extra ao banco de dados.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired private UsuarioV2Service service;

    private void exigirAdmin(UsuarioPrincipal principal) {
        if (!principal.admin())
            throw new BusinessException("Acesso negado — requer perfil ADMIN");
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioV2Response>> listarTodos(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioV2Response> buscar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<UsuarioV2Response> criar(
            @Valid @RequestBody UsuarioV2Request req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        if (req.getSenha() == null || req.getSenha().isBlank())
            throw new BusinessException("Senha é obrigatória para novos usuários");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.cadastrar(req, principal.email()));
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<UsuarioV2Response> atualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioV2Request req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        return ResponseEntity.ok(service.atualizar(id, req, principal.email()));
    }

    /**
     * Atribui (substituindo) as funções de um usuário e opcionalmente
     * promove ou rebaixa o flag de admin.
     * Body: { "funcoes": ["COORDENADOR", "ORIENTADOR"], "admin": false }
     */
    @PatchMapping("/usuarios/{id}/funcoes")
    public ResponseEntity<UsuarioV2Response> atribuirFuncoes(
            @PathVariable Long id,
            @Valid @RequestBody AtribuirFuncoesRequest req,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        return ResponseEntity.ok(service.atribuirFuncoes(id, req, principal.id()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> desativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        service.desativar(id, principal.email());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/usuarios/{id}/reativar")
    public ResponseEntity<UsuarioV2Response> reativar(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        exigirAdmin(principal);
        service.reativar(id, principal.email());
        return ResponseEntity.ok(service.buscarPorId(id));
    }
}
