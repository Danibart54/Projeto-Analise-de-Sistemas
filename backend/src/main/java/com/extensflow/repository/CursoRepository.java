package com.extensflow.repository;

import com.extensflow.model.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    List<Curso> findByAtivoTrue();
    List<Curso> findByNivelAndAtivoTrue(String nivel);
}
