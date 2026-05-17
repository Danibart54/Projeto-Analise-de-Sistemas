package com.extensflow.controller;

import com.extensflow.model.Notificacao;
import com.extensflow.security.UsuarioPrincipal;
import com.extensflow.service.NotificacaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notificacoes")
public class NotificacaoController {

    @Autowired private NotificacaoService service;

    // V-05: usa ID do JWT, não parâmetro de URL — elimina IDOR
    @GetMapping("/minhas")
    public ResponseEntity<List<Notificacao>> listar(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.listarPorUsuario(principal.id()));
    }

    @GetMapping("/minhas/nao-lidas")
    public ResponseEntity<List<Notificacao>> naoLidas(
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        return ResponseEntity.ok(service.listarNaoLidas(principal.id()));
    }

    @PutMapping("/{id}/lida")
    public ResponseEntity<Void> marcarLida(
            @PathVariable Long id,
            @AuthenticationPrincipal UsuarioPrincipal principal) {
        // Verifica que a notificação pertence ao usuário logado
        service.marcarComoLida(id, principal.id());
        return ResponseEntity.noContent().build();
    }
}
