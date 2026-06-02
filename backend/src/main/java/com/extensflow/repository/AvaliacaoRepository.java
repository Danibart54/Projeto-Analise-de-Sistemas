package com.extensflow.repository;
import com.extensflow.model.Avaliacao;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
public interface AvaliacaoRepository extends MongoRepository<Avaliacao, String> {
    List<Avaliacao> findByAvaliadorId(String avaliadorId);
    List<Avaliacao> findByEtapaId(String etapaId);
}
