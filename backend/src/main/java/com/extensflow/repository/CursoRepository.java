package com.extensflow.repository;

import com.extensflow.model.Curso;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CursoRepository extends MongoRepository<Curso, String> {
    List<Curso> findByAtivoTrue();
    List<Curso> findByNivelAndAtivoTrue(String nivel);
}
