package com.extensflow.security;

import com.extensflow.repository.UsuarioRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    public JwtAuthFilter(JwtUtil jwtUtil, UsuarioRepository usuarioRepository) {
        this.jwtUtil = jwtUtil;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String token = extrairToken(request);

        if (token != null && jwtUtil.isValido(token)) {
            String email  = jwtUtil.extrairEmail(token);
            String role   = jwtUtil.extrairRole(token);
            Long   userId = jwtUtil.extrairUserId(token);

            // Verifica se o usuário ainda existe e está ativo
            boolean usuarioAtivo = usuarioRepository.findByEmail(email)
                    .map(u -> u.isAtivo())
                    .orElse(false);

            if (usuarioAtivo) {
                var auth = new UsernamePasswordAuthenticationToken(
                        new UsuarioPrincipal(userId, email, role),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
                );
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
