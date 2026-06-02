package com.extensflow.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtUtil {

    private final SecretKey chave;
    private final long expiracaoMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expiracaoMs) {
        this.chave = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMs = expiracaoMs;
    }

    public String gerarToken(String userId, String email, String role,
                              boolean admin, List<String> funcoes) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId)
                .claim("role", role)
                .claim("admin", admin)
                .claim("funcoes", funcoes)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiracaoMs))
                .signWith(chave)
                .compact();
    }

    public Claims extrairClaims(String token) {
        return Jwts.parser()
                .verifyWith(chave)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extrairEmail(String token) {
        return extrairClaims(token).getSubject();
    }

    public String extrairUserId(String token) {
        return extrairClaims(token).get("userId", String.class);
    }

    public String extrairRole(String token) {
        return extrairClaims(token).get("role", String.class);
    }

    public boolean extrairAdmin(String token) {
        Boolean admin = extrairClaims(token).get("admin", Boolean.class);
        return Boolean.TRUE.equals(admin);
    }

    @SuppressWarnings("unchecked")
    public List<String> extrairFuncoes(String token) {
        Object raw = extrairClaims(token).get("funcoes");
        if (raw instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    public boolean isValido(String token) {
        try {
            extrairClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
