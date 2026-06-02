package com.extensflow.security;

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
import java.util.Map;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioV2Repository usuarioV2Repository;

    public JwtAuthFilter(JwtUtil jwtUtil, UsuarioV2Repository usuarioV2Repository) {
        this.jwtUtil = jwtUtil;
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
            String       userId  = jwtUtil.extrairUserId(token);
            boolean      admin   = jwtUtil.extrairAdmin(token);
            List<String> funcoes = jwtUtil.extrairFuncoes(token);

            boolean usuarioAtivo = usuarioV2Repository
                    .findByEmailIgnoreCase(email)
                    .map(u -> u.isAtivo())
                    .orElse(false);

            if (usuarioAtivo) {
                Map<String, String> mapa = Map.of(
                    "COORDENADOR",        "COORDENADORIA",
                    "COMISSAO_JULGADORA", "COMISSAO",
                    "SECRETARIO",         "SECRETARIA",
                    "ORIENTADOR",         "ORIENTADOR",
                    "ALUNO",              "ALUNO"
                );

                List<GrantedAuthority> authorities = new ArrayList<>();
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                for (String f : funcoes) {
                    String mapped    = mapa.getOrDefault(f.toUpperCase(), f.toUpperCase());
                    String authority = "ROLE_" + mapped;
                    if (authorities.stream().noneMatch(a -> a.getAuthority().equals(authority))) {
                        authorities.add(new SimpleGrantedAuthority(authority));
                    }
                }
                if (admin) authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));

                var principal = new UsuarioPrincipal(userId, email, role, admin, funcoes);
                var auth = new UsernamePasswordAuthenticationToken(principal, null, authorities);
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
