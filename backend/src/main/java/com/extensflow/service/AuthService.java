package com.extensflow.service;

import com.extensflow.dto.LoginRequest;
import com.extensflow.dto.LoginResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.model.*;
import com.extensflow.repository.UsuarioRepository;
import com.extensflow.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // V-10: canal de auditoria dedicado — direcionado para logs/auditoria.log
    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request, String ipCliente) {

        // V-07 + V-10: mensagem genérica ao cliente; motivo real só no log
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);

        if (usuario == null) {
            // V-10: registrar tentativa com e-mail inexistente
            audit.warn("LOGIN_FAIL motivo=EMAIL_NAO_ENCONTRADO email={} ip={}",
                    request.getEmail(), ipCliente);
            // V-07: mesma mensagem genérica independente do motivo real
            throw new BusinessException("Credenciais inválidas");
        }

        if (!passwordEncoder.matches(request.getSenha(), usuario.getSenha())) {
            // V-10: registrar senha errada com id do usuário (sem logar a senha)
            audit.warn("LOGIN_FAIL motivo=SENHA_INCORRETA email={} userId={} ip={}",
                    request.getEmail(), usuario.getId(), ipCliente);
            throw new BusinessException("Credenciais inválidas");
        }

        if (!usuario.isAtivo()) {
            // V-10: registrar tentativa em conta inativa — pode indicar ataque após desligamento
            audit.warn("LOGIN_FAIL motivo=USUARIO_INATIVO email={} userId={} ip={}",
                    request.getEmail(), usuario.getId(), ipCliente);
            throw new BusinessException("Credenciais inválidas");
        }

        String perfil = resolverPerfil(usuario);
        String token  = jwtUtil.gerarToken(usuario.getId(), usuario.getEmail(), perfil);

        // V-10: login bem-sucedido — registrar com perfil e IP
        audit.info("LOGIN_OK email={} userId={} perfil={} ip={}",
                usuario.getEmail(), usuario.getId(), perfil, ipCliente);

        return new LoginResponse(token, usuario.getNome(), usuario.getEmail(), perfil);
    }

    private String resolverPerfil(Usuario u) {
        if (u instanceof Aluno)          return "ALUNO";
        if (u instanceof Orientador)     return "ORIENTADOR";
        if (u instanceof MembroComissao) return "COMISSAO";
        return "SECRETARIA";
    }
}
