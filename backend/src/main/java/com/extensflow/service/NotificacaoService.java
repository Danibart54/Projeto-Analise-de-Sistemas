package com.extensflow.service;

import com.extensflow.exception.ResourceNotFoundException;
import com.extensflow.model.Notificacao;
import com.extensflow.model.Solicitacao;
import com.extensflow.model.Usuario;
import com.extensflow.repository.NotificacaoRepository;
import com.extensflow.repository.SolicitacaoRepository;
import com.extensflow.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificacaoService {

    private static final Logger audit = LoggerFactory.getLogger("AUDITORIA");

    @Autowired private NotificacaoRepository notificacaoRepo;
    @Autowired private UsuarioRepository usuarioRepo;
    @Autowired private SolicitacaoRepository solicitacaoRepo;

    @Transactional
    public Notificacao enviar(Long destinatarioId, Long solicitacaoId,
                              String tipo, String mensagem) {
        Usuario destinatario = usuarioRepo.findById(destinatarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));

        Notificacao n = new Notificacao();
        n.setDestinatario(destinatario);
        n.setTipo(tipo);
        n.setMensagem(mensagem);

        if (solicitacaoId != null) {
            Solicitacao sol = solicitacaoRepo.findById(solicitacaoId).orElse(null);
            n.setSolicitacao(sol);
        }
        Notificacao salva = notificacaoRepo.save(n);

        // V-10: registrar envio de notificação
        audit.info("NOTIFICACAO_ENVIADA id={} tipo={} destinatario={} solicitacao={}",
                salva.getId(), tipo, destinatarioId, solicitacaoId);
        return salva;
    }

    public List<Notificacao> listarPorUsuario(Long usuarioId) {
        return notificacaoRepo.findByDestinatarioIdOrderByDataEnvioDesc(usuarioId);
    }

    public List<Notificacao> listarNaoLidas(Long usuarioId) {
        return notificacaoRepo.findByDestinatarioIdAndLidaFalse(usuarioId);
    }

    // V-05: verifica propriedade antes de marcar como lida
    @Transactional
    public void marcarComoLida(Long notificacaoId, Long usuarioId) {
        Notificacao n = notificacaoRepo.findById(notificacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada"));

        if (!n.getDestinatario().getId().equals(usuarioId))
            throw new AccessDeniedException("Esta notificação não pertence ao usuário logado");

        n.setLida(true);
        notificacaoRepo.save(n);
    }
}
