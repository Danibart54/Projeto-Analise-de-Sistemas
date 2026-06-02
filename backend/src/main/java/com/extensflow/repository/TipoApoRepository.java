package com.extensflow.repository;

import com.extensflow.model.TipoApo;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TipoApoRepository extends MongoRepository<TipoApo, String> {
    List<TipoApo> findByAtivoTrue();
}
