package com.extensflow.config;

import com.extensflow.repository.UsuarioV2Repository;
import com.extensflow.security.JwtAuthFilter;
import com.extensflow.security.JwtUtil;
import com.extensflow.security.RateLimitFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired private JwtUtil             jwtUtil;
    @Autowired private UsuarioV2Repository usuarioV2Repository;
    @Autowired private RateLimitFilter     rateLimitFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(jwtUtil, usuarioV2Repository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // ── Públicos ────────────────────────────────────────
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        // ── Admin (guard de negócio feito no AdminController) ──
                        .requestMatchers("/api/admin/**").authenticated()

                        // ── Tipos de APO e Cursos (leitura pública p/ autenticados) ──
                        .requestMatchers(HttpMethod.GET, "/api/tipos-apo/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/cursos/**").authenticated()
                        .requestMatchers("/api/tipos-apo/**").hasRole("ADMIN")
                        .requestMatchers("/api/cursos/**").hasRole("ADMIN")

                        // ── APOs (novo fluxo) ──────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/apos").authenticated()
                        .requestMatchers(HttpMethod.GET,  "/api/apos/**").authenticated()
                        .requestMatchers(HttpMethod.PUT,  "/api/apos/*/orientador/**")
                                .hasAnyRole("ORIENTADOR","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/apos/*/comissao/**")
                                .hasAnyRole("COMISSAO","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/apos/*/coordenacao/**")
                                .hasAnyRole("COORDENADORIA","COORDENACAO","ADMIN")
                        .requestMatchers(HttpMethod.PUT,  "/api/apos/*/secretaria/**")
                                .hasAnyRole("SECRETARIA","ADMIN")

                        // ── Solicitações ────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/solicitacoes").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.GET,  "/api/solicitacoes/aluno/**").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/enviar").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/formulario").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/resultado-final")
                                .hasAnyRole("COMISSAO","COORDENADORIA","ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/api/solicitacoes")
                                .hasAnyRole("ORIENTADOR","COMISSAO","SECRETARIA","COORDENADORIA","ADMIN")

                        // ── Votação dos coordenadores ────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/solicitacoes/*/votar")
                                .hasAnyRole("COORDENADORIA","ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/solicitacoes/*/aprovar")
                                .hasAnyRole("COORDENADORIA","ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/api/solicitacoes/*/aprovacoes/**")
                                .hasAnyRole("COORDENADORIA","SECRETARIA","COMISSAO","ORIENTADOR","ADMIN")
                        // ── Aval final da comissão ───────────────────────────
                        .requestMatchers(HttpMethod.PUT, "/api/solicitacoes/*/aval-final")
                                .hasAnyRole("COMISSAO","ADMIN")

                        // ── Avaliações ───────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/api/avaliacoes/**")
                                .hasAnyRole("ORIENTADOR","COMISSAO","ADMIN")

                        // ── Notificações ─────────────────────────────────────
                        .requestMatchers("/api/notificacoes/**").authenticated()

                        // ── Usuários legados ─────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/api/usuarios/admin").hasAnyRole("SECRETARIA","ADMIN")
                        .requestMatchers(HttpMethod.DELETE,  "/api/usuarios/**").hasAnyRole("SECRETARIA","ADMIN")
                        // Aluno pode listar orientadores para preencher o formulário de solicitação
                        .requestMatchers(HttpMethod.GET, "/api/usuarios/orientadores").authenticated()
                        .requestMatchers(HttpMethod.GET,     "/api/usuarios/**")
                                .hasAnyRole("SECRETARIA","COMISSAO","ADMIN")

                        // ── Usuários V2 ──────────────────────────────────────
                        .requestMatchers("/api/v2/usuarios/**").authenticated()

                        .anyRequest().authenticated()
                )

                .headers(h -> h.frameOptions(f -> f.sameOrigin()))
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
