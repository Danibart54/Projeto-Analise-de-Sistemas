package com.extensflow.service;

import com.extensflow.dto.LoginRequest;
import com.extensflow.dto.LoginResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.model.UsuarioV2;
import com.extensflow.repository.UsuarioV2Repository;
import com.extensflow.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private UsuarioV2Repository usuarioV2Repository;
    @Autowired private PasswordEncoder     passwordEncoder;
    @Autowired private JwtUtil             jwtUtil;

    private static final Map<String, String> FUNCAO_PARA_ROLE = Map.of(
        "COORDENADOR",        "COORDENADORIA",
        "COMISSAO_JULGADORA", "COMISSAO",
        "SECRETARIO",         "SECRETARIA",
        "ORIENTADOR",         "ORIENTADOR",
        "ALUNO",              "ALUNO"
    );

    private static final List<String> PRIORIDADE = List.of(
        "COORDENADOR", "COMISSAO_JULGADORA", "ORIENTADOR", "SECRETARIO", "ALUNO"
    );

    public LoginResponse login(LoginRequest request, String ipCliente) {
        UsuarioV2 u = usuarioV2Repository.findByEmailIgnoreCase(request.getEmail())
                .orElseThrow(() -> {
                    audit.warn("LOGIN_FAIL motivo=EMAIL_NAO_ENCONTRADO email={} ip={}", request.getEmail(), ipCliente);
                    return new BusinessException("Credenciais inválidas");
                });

        if (!passwordEncoder.matches(request.getSenha(), u.getSenha())) {
            audit.warn("LOGIN_FAIL motivo=SENHA_INCORRETA email={} ip={}", u.getEmail(), ipCliente);
            throw new BusinessException("Credenciais inválidas");
        }
        if (!u.isAtivo()) {
            audit.warn("LOGIN_FAIL motivo=USUARIO_INATIVO email={} ip={}", u.getEmail(), ipCliente);
            throw new BusinessException("Credenciais inválidas");
        }

        List<String> funcoes = u.getFuncoes() != null ? u.getFuncoes() : List.of();
        String perfil = u.isAdmin() ? "ADMIN" : resolverPerfil(funcoes);
        String token  = jwtUtil.gerarToken(u.getId(), u.getEmail(), perfil, u.isAdmin(), funcoes);

        audit.info("LOGIN_OK email={} userId={} perfil={} admin={} funcoes={} ip={}",
                u.getEmail(), u.getId(), perfil, u.isAdmin(), funcoes, ipCliente);

        return new LoginResponse(token, u.getId(), u.getNome(), u.getEmail(), perfil, u.isAdmin(), funcoes);
    }

    private String resolverPerfil(List<String> funcoes) {
        return funcoes.stream()
                .map(String::toUpperCase)
                .filter(PRIORIDADE::contains)
                .min((a, b) -> PRIORIDADE.indexOf(a) - PRIORIDADE.indexOf(b))
                .map(f -> FUNCAO_PARA_ROLE.getOrDefault(f, f))
                .orElse("USUARIO");
    }
}
