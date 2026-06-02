package com.extensflow.repository;
import com.extensflow.model.UsuarioV2;
import org.springframework.data.mongodb.repository.MongoRepository;
public interface OrientadorRepository extends MongoRepository<UsuarioV2, String> {}
