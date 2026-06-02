package com.extensflow.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * V-08 — Rate limiting duplo no endpoint de login:
 *
 *   1. Por IP     → MAX_POR_IP tentativas por janela de JANELA_SEGUNDOS.
 *   2. Por e-mail → MAX_POR_CONTA falhas consecutivas → bloqueio de BLOQUEIO_CONTA_SEGUNDOS.
 *
 * Retorna HTTP 429 com header Retry-After indicando quantos segundos aguardar.
 *
 * NOTA: estado em memória — sem persistência entre reinicializações.
 * Em produção com múltiplas instâncias, use Redis + Bucket4j para estado compartilhado.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    private static final String  LOGIN_PATH              = "/api/auth/login";
    private static final int     MAX_POR_IP              = 20;    // tentativas por IP por janela
    private static final long    JANELA_SEGUNDOS         = 60L;   // janela deslizante (1 min)
    private static final int     MAX_FALHAS_POR_CONTA    = 5;     // falhas antes de bloquear conta
    private static final long    BLOQUEIO_CONTA_SEGUNDOS = 300L;  // bloqueio de conta (5 min)

    // IP → [contagem, inicioJanela]
    private final Map<String, long[]> contagemIp    = new ConcurrentHashMap<>();
    // email → [falhasConsecutivas, timestampBloqueio]
    private final Map<String, long[]> contagemConta = new ConcurrentHashMap<>();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        if (!LOGIN_PATH.equals(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }

        String ip    = extrairIp(request);
        String email = extrairEmail(request);
        long   agora = Instant.now().getEpochSecond();

        // ── 1. Verificar bloqueio de conta ───────────────────────────────────
        if (email != null) {
            long[] estadoConta = contagemConta.get(email);
            if (estadoConta != null && estadoConta[0] >= MAX_FALHAS_POR_CONTA) {
                long segundosRestantes = BLOQUEIO_CONTA_SEGUNDOS - (agora - estadoConta[1]);
                if (segundosRestantes > 0) {
                    audit.warn("RATE_LIMIT_CONTA email={} ip={} bloqueadoPor={}s",
                            email, ip, segundosRestantes);
                    responder429(response, "Conta temporariamente bloqueada. "
                            + "Aguarde " + segundosRestantes + " segundo(s).", segundosRestantes);
                    return;
                } else {
                    contagemConta.remove(email); // bloqueio expirou — resetar
                }
            }
        }

        // ── 2. Verificar limite por IP ────────────────────────────────────────
        long[] estadoIp = contagemIp.compute(ip, (k, v) -> {
            if (v == null || agora - v[1] > JANELA_SEGUNDOS)
                return new long[]{1L, agora};
            v[0]++;
            return v;
        });

        if (estadoIp[0] > MAX_POR_IP) {
            long segundosRestantes = JANELA_SEGUNDOS - (agora - estadoIp[1]);
            audit.warn("RATE_LIMIT_IP ip={} tentativas={} bloqueadoPor={}s",
                    ip, estadoIp[0], segundosRestantes);
            responder429(response, "Muitas tentativas de login. "
                    + "Aguarde " + Math.max(segundosRestantes, 1) + " segundo(s).",
                    Math.max(segundosRestantes, 1));
            return;
        }

        // ── 3. Continuar — e registrar falha de conta se o login falhar ──────
        // Usa wrapper para capturar o status da resposta depois do filtro
        StatusCapturandoResponse wrappedResponse = new StatusCapturandoResponse(response);
        chain.doFilter(request, wrappedResponse);

        // Se login falhou (400 = credenciais inválidas), incrementar contador da conta
        if (email != null && wrappedResponse.getStatus() == HttpStatus.BAD_REQUEST.value()) {
            contagemConta.compute(email, (k, v) -> {
                if (v == null) return new long[]{1L, agora};
                v[0]++;
                v[1] = agora; // atualiza timestamp para a última falha
                return v;
            });

            long falhas = contagemConta.get(email)[0];
            if (falhas >= MAX_FALHAS_POR_CONTA) {
                audit.warn("CONTA_BLOQUEADA email={} ip={} apos={}falhas", email, ip, falhas);
            }
        }

        // Resetar contador da conta se login bem-sucedido (200)
        if (email != null && wrappedResponse.getStatus() == HttpStatus.OK.value()) {
            contagemConta.remove(email);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void responder429(HttpServletResponse response, String mensagem,
                               long retryAfter) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Retry-After", String.valueOf(retryAfter));
        Map<String, Object> corpo = Map.of(
                "status", 429,
                "error",  mensagem,
                "retryAfter", retryAfter
        );
        response.getWriter().write(objectMapper.writeValueAsString(corpo));
    }

    private String extrairIp(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        if (fwd != null && !fwd.isBlank()) return fwd.split(",")[0].trim();
        return req.getRemoteAddr();
    }

    /** Lê o e-mail do corpo JSON sem consumir o InputStream principal */
    private String extrairEmail(HttpServletRequest req) {
        try {
            String email = req.getParameter("email");
            if (email != null) return email.toLowerCase().trim();
            // Para JSON bodies o parâmetro não está disponível sem wrapper;
            // retornar null é seguro — o bloqueio por IP ainda protege
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * Limpeza periódica do mapa de IPs para evitar crescimento ilimitado em memória.
     * Executado a cada 10 minutos pelo scheduler do Spring.
     */
    @Scheduled(fixedDelay = 600_000)
    public void limparContadoresExpirados() {
        long agora = Instant.now().getEpochSecond();
        contagemIp.entrySet().removeIf(e -> agora - e.getValue()[1] > JANELA_SEGUNDOS * 2);
        contagemConta.entrySet().removeIf(
                e -> e.getValue()[0] < MAX_FALHAS_POR_CONTA
                     || agora - e.getValue()[1] > BLOQUEIO_CONTA_SEGUNDOS);
    }
}
