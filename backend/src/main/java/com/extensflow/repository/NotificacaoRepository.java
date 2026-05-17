package com.extensflow.repository;

import com.extensflow.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByDestinatarioIdOrderByDataEnvioDesc(Long destinatarioId);
    List<Notificacao> findByDestinatarioIdAndLidaFalse(Long destinatarioId);
}
