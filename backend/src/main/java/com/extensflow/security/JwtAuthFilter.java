package com.extensflow.security;

import com.extensflow.repository.UsuarioRepository;
import com.extensflow.repository.UsuarioV2Repository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final UsuarioV2Repository usuarioV2Repository;

    public JwtAuthFilter(JwtUtil jwtUtil,
                         UsuarioRepository usuarioRepository,
                         UsuarioV2Repository usuarioV2Repository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
        this.usuarioV2Repository = usuarioV2Repository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String token = extrairToken(request);

        if (token != null && jwtUtil.isValido(token)) {
            String       email   = jwtUtil.extrairEmail(token);
            String       role    = jwtUtil.extrairRole(token);
            Long         userId  = jwtUtil.extrairUserId(token);
            boolean      admin   = jwtUtil.extrairAdmin(token);
            List<String> funcoes = jwtUtil.extrairFuncoes(token);

            // Verifica se o usuário ainda está ativo — checa legado e V2
            boolean usuarioAtivo =
                usuarioRepository.findByEmail(email)
                    .map(u -> u.isAtivo())
                    .orElseGet(() ->
                        usuarioV2Repository.findByEmailIgnoreCase(email)
                            .map(u -> u.isAtivo())
                            .orElse(false)
                    );

            if (usuarioAtivo) {
                // Monta authorities: role principal + todas as funções + ADMIN se aplicável
                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                // Mapeamento funcao V2 → role Spring Security
                java.util.Map<String, String> mapa = java.util.Map.of(
                    "COORDENADOR",        "COORDENADORIA",
                    "COMISSAO_JULGADORA", "COMISSAO",
                    "SECRETARIO",         "SECRETARIA",
                    "ORIENTADOR",         "ORIENTADOR",
                    "ALUNO",              "ALUNO"
                );
                for (String f : funcoes) {
                    String mapped = mapa.getOrDefault(f.toUpperCase(), f.toUpperCase());
                    String authority = "ROLE_" + mapped;
                    // Evita duplicata da role principal
                    if (authorities.stream().noneMatch(a -> a.getAuthority().equals(authority))) {
                        authorities.add(new SimpleGrantedAuthority(authority));
                    }
                }

                if (admin) {
                    authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                }

                var principal = new UsuarioPrincipal(userId, email, role, admin, funcoes);
                var auth = new UsernamePasswordAuthenticationToken(
                        principal, null, authorities);
                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(request, response);
    }

    private String extrairToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
