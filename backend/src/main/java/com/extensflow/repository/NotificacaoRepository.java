package com.extensflow.repository;
import com.extensflow.model.Notificacao;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface NotificacaoRepository extends MongoRepository<Notificacao, String> {
    List<Notificacao> findByDestinatarioIdOrderByDataEnvioDesc(String destinatarioId);
    List<Notificacao> findByDestinatarioIdAndLidaFalse(String destinatarioId);
}
