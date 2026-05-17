package com.extensflow.config;

import com.extensflow.repository.UsuarioRepository;
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

    @Autowired private JwtUtil jwtUtil;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private RateLimitFilter rateLimitFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public JwtAuthFilter jwtAuthFilter() {
        return new JwtAuthFilter(jwtUtil, usuarioRepository);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/usuarios/registro").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/solicitacoes").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.GET,  "/api/solicitacoes/aluno/**").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/enviar").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/formulario").hasRole("ALUNO")
                        .requestMatchers(HttpMethod.PUT,  "/api/solicitacoes/*/resultado-final")
                                .hasAnyRole("COMISSAO","COORDENADORIA")
                        .requestMatchers(HttpMethod.GET,  "/api/solicitacoes")
                                .hasAnyRole("ORIENTADOR","COMISSAO","SECRETARIA","COORDENADORIA")

                        .requestMatchers(HttpMethod.POST, "/api/avaliacoes/**")
                                .hasAnyRole("ORIENTADOR","COMISSAO")

                        .requestMatchers("/api/notificacoes/**").authenticated()

                        .requestMatchers(HttpMethod.POST,   "/api/usuarios/admin").hasRole("SECRETARIA")
                        .requestMatchers(HttpMethod.DELETE,  "/api/usuarios/**").hasRole("SECRETARIA")
                        .requestMatchers(HttpMethod.GET,     "/api/usuarios/**")
                                .hasAnyRole("SECRETARIA","COMISSAO")

                        .anyRequest().authenticated()
                )

                .headers(h -> h.frameOptions(f -> f.sameOrigin()))

                // V-08: Rate limit antes do filtro JWT
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
