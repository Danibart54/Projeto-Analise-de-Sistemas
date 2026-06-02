package com.extensflow.controller;

import com.extensflow.dto.LoginRequest;
import com.extensflow.dto.LoginResponse;
import com.extensflow.dto.RegistroRequest;
import com.extensflow.dto.UsuarioV2Response;
import com.extensflow.service.AuthService;
import com.extensflow.service.UsuarioV2Service;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService      authService;
    @Autowired private UsuarioV2Service usuarioV2Service;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        String ip = obterIp(httpRequest);
        return ResponseEntity.ok(authService.login(request, ip));
    }

    /**
     * Auto-cadastro público — cria conta com função ALUNO ou ORIENTADOR.
     * Não requer autenticação. Funções privilegiadas são bloqueadas no serviço.
     */
    @PostMapping("/registro")
    public ResponseEntity<UsuarioV2Response> registrar(
            @Valid @RequestBody RegistroRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(usuarioV2Service.registrar(req));
    }

    private String obterIp(HttpServletRequest req) {
        String forwarded = req.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return req.getRemoteAddr();
    }
}
