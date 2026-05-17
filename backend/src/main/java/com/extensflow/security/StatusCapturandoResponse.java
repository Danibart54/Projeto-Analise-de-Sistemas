package com.extensflow.security;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

/**
 * Wrapper de HttpServletResponse que memoriza o status HTTP definido durante a cadeia de filtros.
 * Necessário para o RateLimitFilter saber se o login foi bem-sucedido ou não,
 * sem precisar interceptar o corpo da resposta.
 */
public class StatusCapturandoResponse extends HttpServletResponseWrapper {

    private int status = HttpServletResponse.SC_OK;

    public StatusCapturandoResponse(HttpServletResponse response) {
        super(response);
    }

    @Override
    public void setStatus(int sc) {
        this.status = sc;
        super.setStatus(sc);
    }

    @Override
    @SuppressWarnings("deprecation")
    public void sendError(int sc) throws java.io.IOException {
        this.status = sc;
        super.sendError(sc);
    }

    @Override
    public void sendError(int sc, String msg) throws java.io.IOException {
        this.status = sc;
        super.sendError(sc, msg);
    }

    @Override
    public int getStatus() {
        return status;
    }
}
