package com.extensflow.repository;

import com.extensflow.model.TipoApo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TipoApoRepository extends JpaRepository<TipoApo, Long> {
    List<TipoApo> findByAtivoTrue();
    List<TipoApo> findByAplicavelParaInAndAtivoTrue(List<String> aplicavelPara);
}
