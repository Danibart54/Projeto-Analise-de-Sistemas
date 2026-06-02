package com.extensflow.service;

import com.extensflow.dto.LoginRequest;
import com.extensflow.dto.LoginResponse;
import com.extensflow.exception.BusinessException;
import com.extensflow.model.*;
import com.extensflow.repository.UsuarioRepository;
import com.extensflow.repository.UsuarioV2Repository;
import com.extensflow.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private UsuarioRepository   usuarioRepository;
    @Autowired private UsuarioV2Repository usuarioV2Repository;
    @Autowired private PasswordEncoder     passwordEncoder;
    @Autowired private JwtUtil             jwtUtil;

    public LoginResponse login(LoginRequest request, String ipCliente) {

        // Tenta primeiro nos usuários V2 (com admin/funções), depois nos legados
        Optional<UsuarioV2> v2Opt = usuarioV2Repository.findByEmailIgnoreCase(request.getEmail());

        if (v2Opt.isPresent()) {
            UsuarioV2 u = v2Opt.get();
            validarSenha(request, u.getSenha(), u.isAtivo(), request.getEmail(), u.getId(), ipCliente);

            String perfil = u.isAdmin() ? "ADMIN" : resolverPerfilV2(u);
            List<String> funcoes = u.getFuncoes().stream()
                    .map(f -> f.getNome().toUpperCase()).collect(java.util.stream.Collectors.toList());
            String token = jwtUtil.gerarToken(u.getId(), u.getEmail(), perfil, u.isAdmin(), funcoes);
            audit.info("LOGIN_OK email={} userId={} perfil={} admin={} funcoes={} ip={}",
                    u.getEmail(), u.getId(), perfil, u.isAdmin(), funcoes, ipCliente);
            return new LoginResponse(token, u.getId(), u.getNome(), u.getEmail(), perfil, u.isAdmin(), funcoes);
        }

        // Fallback: usuários legados (herança)
        Usuario u = usuarioRepository.findByEmail(request.getEmail()).orElse(null);
        if (u == null) {
            audit.warn("LOGIN_FAIL motivo=EMAIL_NAO_ENCONTRADO email={} ip={}", request.getEmail(), ipCliente);
            throw new BusinessException("Credenciais inválidas");
        }
        validarSenha(request, u.getSenha(), u.isAtivo(), request.getEmail(), u.getId(), ipCliente);

        String perfil = resolverPerfilLegado(u);
        List<String> funcoesLegado = List.of(perfil);
        String token  = jwtUtil.gerarToken(u.getId(), u.getEmail(), perfil, false, List.of());
        audit.info("LOGIN_OK email={} userId={} perfil={} ip={}", u.getEmail(), u.getId(), perfil, ipCliente);
        return new LoginResponse(token, u.getId(), u.getNome(), u.getEmail(), perfil, false, funcoesLegado);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void validarSenha(LoginRequest req, String hashSalvo, boolean ativo,
                               String email, Long userId, String ip) {
        if (!passwordEncoder.matches(req.getSenha(), hashSalvo)) {
            audit.warn("LOGIN_FAIL motivo=SENHA_INCORRETA email={} userId={} ip={}", email, userId, ip);
            throw new BusinessException("Credenciais inválidas");
        }
        if (!ativo) {
            audit.warn("LOGIN_FAIL motivo=USUARIO_INATIVO email={} userId={} ip={}", email, userId, ip);
            throw new BusinessException("Credenciais inválidas");
        }
    }

    private String resolverPerfilV2(UsuarioV2 u) {
        // Prioridade de perfil: a função de maior privilégio vira o perfil JWT
        // Mapeamento: nome da Funcao → role usada no JWT / SecurityConfig
        java.util.Map<String, String> mapa = java.util.Map.of(
            "COORDENADOR",        "COORDENADORIA",
            "COMISSAO_JULGADORA", "COMISSAO",
            "SECRETARIO",         "SECRETARIA",
            "ORIENTADOR",         "ORIENTADOR",
            "ALUNO",              "ALUNO"
        );
        List<String> prioridade = List.of(
            "COORDENADOR", "COMISSAO_JULGADORA", "ORIENTADOR", "SECRETARIO", "ALUNO"
        );
        return u.getFuncoes().stream()
                .map(f -> f.getNome().toUpperCase())
                .filter(prioridade::contains)
                .min((a, b) -> prioridade.indexOf(a) - prioridade.indexOf(b))
                .map(f -> mapa.getOrDefault(f, f))
                .orElse("USUARIO");
    }

    private String resolverPerfilLegado(Usuario u) {
        if (u instanceof Aluno)          return "ALUNO";
        if (u instanceof Orientador)     return "ORIENTADOR";
        if (u instanceof MembroComissao) return "COMISSAO";
        return "SECRETARIA";
    }
}
